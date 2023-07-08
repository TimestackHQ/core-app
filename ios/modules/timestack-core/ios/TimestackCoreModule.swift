import AVFoundation
import ExpoModulesCore
import React
import Photos
import UIKit

public class TimestackCoreModule: Module {
    
    public func definition() -> ModuleDefinition {
        Name("TimestackCore")
    
        Constants([
            "Name": "TimestackCore",
            "NativeClientVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String
        ])
        
        View(TimestackCoreView.self) {
            Prop("name") { (view: TimestackCoreView, prop: String) in
                print(prop)
            }
            Prop("selectedPhotos") { (view: TimestackCoreView, prop: [String]) in
                
                view.setSelectedImages(selectedImagesList: prop)
                
            }
            Events(
                "onMediaPicked"
            )
        }
        
        AsyncFunction("fetchImage") { (assetIdentifier: String, mediaTypeString: String, maxWidth: Int?, maxHeight: Int?, videoLength: Int?) -> [String: Any] in
            var result: [String: Any] = [:]
            
            guard let mediaType = convertToMediaType(mediaTypeString) else {
                result["error"] = "invalid type"
                return result
            }
            
            guard let asset = PHAsset.fetchAssets(withLocalIdentifiers: [assetIdentifier], options: nil).firstObject else {
                result["error"] = "asset not found"
                return result
            }
            
            var node: [String: Any] = [:]
            var compressedURL: URL?
            
            if mediaType == .image {
                if let compressedImageURL = compressImage(asset: asset, maxWidth: maxWidth, maxHeight: maxHeight) {
                    node = createImageNode(asset: asset, compressedURL: compressedImageURL)
                    compressedURL = compressedImageURL
                }
            } else if mediaType == .video {
                let semaphore = DispatchSemaphore(value: 0)
                
                // Check if the video asset is stored in iCloud
                let options = PHVideoRequestOptions()
                options.isNetworkAccessAllowed = true
                options.deliveryMode = .highQualityFormat
                
                PHImageManager.default().requestAVAsset(forVideo: asset, options: options) { [self] (avAsset, _, _) in
                    if let avURLAsset = avAsset as? AVURLAsset {
                        if avURLAsset.url.isFileURL {
                            // Video is already downloaded
                            if let compressedVideoURL = self.compressVideo(asset: avURLAsset, maxWidth: maxWidth, maxHeight: maxHeight) {
                                node = createVideoNode(asset: asset, compressedURL: compressedVideoURL)
                                compressedURL = compressedVideoURL
                            } else {
                                result["error"] = "video compression failed"
                            }
                        } else {
                            // Video is stored in iCloud, download it first
                            PHAssetResourceManager.default().writeData(for: PHAssetResource.assetResources(for: asset).first!, toFile: URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("tempVideo"), options: nil) { (error) in
                                if let error = error {
                                    result["error"] = "video download failed: \(error.localizedDescription)"
                                } else {
                                    // Video downloaded successfully, compress it
                                    if let localURL = URL(string: "file://" + NSTemporaryDirectory().appending("tempVideo")) {
                                        let downloadedAsset = AVAsset(url: localURL)
                                        if let compressedVideoURL = self.compressVideo(asset: downloadedAsset, maxWidth: maxWidth, maxHeight: maxHeight) {
                                            node = self.createVideoNode(asset: asset, compressedURL: compressedVideoURL)
                                            compressedURL = compressedVideoURL
                                        } else {
                                            result["error"] = "video compression failed"
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        result["error"] = "video compression failed"
                    }
                    semaphore.signal()
                }
                semaphore.wait()
            }
            
            if !node.isEmpty {
                result["node"] = node
            }
            
            if let compressedURL = compressedURL {
                result["compressedURL"] = "file://" + compressedURL.path
            }
            
            return result
        }




    }
    
    private func convertToMediaType(_ mediaTypeString: String) -> PHAssetMediaType? {
        switch mediaTypeString {
        case "image":
            return .image
        case "video":
            return .video
        default:
            return nil
        }
    }
    
    private func compressImage(asset: PHAsset, maxWidth: Int?, maxHeight: Int?) -> URL? {
        let requestOptions = PHImageRequestOptions()
        requestOptions.isSynchronous = true
        requestOptions.deliveryMode = .highQualityFormat // Adjust delivery mode as needed

        let imageManager = PHImageManager.default()

        var targetSize: CGSize
        if let maxWidth = maxWidth, let maxHeight = maxHeight {
            // Calculate target size with aspect ratio based on maximum width and height
            let aspectRatio = CGFloat(asset.pixelWidth) / CGFloat(asset.pixelHeight)
            let maxAspectRatio = CGFloat(maxWidth) / CGFloat(maxHeight)

            if aspectRatio > maxAspectRatio {
                // Adjust width to match the maximum width, and calculate height based on aspect ratio
                targetSize = CGSize(width: CGFloat(maxWidth), height: CGFloat(maxWidth) / aspectRatio)
            } else {
                // Adjust height to match the maximum height, and calculate width based on aspect ratio
                targetSize = CGSize(width: CGFloat(maxHeight) * aspectRatio, height: CGFloat(maxHeight))
            }
        } else {
            // Keep original size if no maximum width or height is specified
            targetSize = CGSize(width: asset.pixelWidth, height: asset.pixelHeight)
        }

        var compressedURL: URL?

        imageManager.requestImage(for: asset, targetSize: targetSize, contentMode: .aspectFit, options: requestOptions) { (image, _) in
            if let compressedImage = image {
                compressedURL = self.saveCompressedImage(compressedImage)
            }
        }

        return compressedURL
    }


    
    private func compressVideo(asset: AVAsset, maxWidth: Int?, maxHeight: Int?) -> URL? {
        let fileName = "\(UUID().uuidString).mp4"
        let outputURL = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(fileName)
        
        guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetHighestQuality) else {
            return nil
        }
        
        exportSession.outputFileType = .mp4
        exportSession.outputURL = outputURL
        
        let semaphore = DispatchSemaphore(value: 0)
        
        exportSession.exportAsynchronously {
            defer {
                semaphore.signal()
            }
            
            if exportSession.status == .completed {
                print("Video compression completed")
            } else if exportSession.status == .failed {
                print("Video compression failed: \(exportSession.error?.localizedDescription ?? "")")
            } else if exportSession.status == .cancelled {
                print("Video compression cancelled")
            }
        }
        
        _ = semaphore.wait(timeout: .distantFuture)
        
        return outputURL
    }


    
    
    private func calculateOutputSize(asset: AVAsset) -> CGSize {
        let videoTrack = asset.tracks(withMediaType: .video).first
        let naturalSize = videoTrack?.naturalSize ?? .zero
        let targetWidth: CGFloat = 1920

        if naturalSize.width <= targetWidth {
            return naturalSize
        }

        let aspectRatio = naturalSize.width / naturalSize.height
        let targetHeight = targetWidth / aspectRatio

        return CGSize(width: targetWidth, height: targetHeight)
    }
    
    
    
    private func saveCompressedImage(_ image: UIImage) -> URL? {
        let targetSize: CGFloat = 0.5 * 1024 * 1024 // 1MB
        
        var compressionQuality: CGFloat = 1.0
        var imageData = image.jpegData(compressionQuality: compressionQuality)
        
        while let data = imageData, data.count > Int(targetSize) && compressionQuality > 0.0 {
            compressionQuality -= 0.1
            imageData = image.jpegData(compressionQuality: compressionQuality)
        }
        
        guard let finalImageData = imageData else {
            return nil
        }
        
        let uniqueFileName = ProcessInfo.processInfo.globallyUniqueString
        let fileURL = FileManager.default.temporaryDirectory.appendingPathComponent(uniqueFileName)
        
        do {
            try finalImageData.write(to: fileURL)
            return fileURL
        } catch {
            print("Failed to save compressed image:", error)
            return nil
        }
    }
    
    private func createImageNode(asset: PHAsset, compressedURL: URL?) -> [String: Any] {
        var node: [String: Any] = [:]
        
        node = [
            "type": "image",
            "group_name": "",
            "image": [
                "filename": asset.value(forKey: "filename") as? String ?? "",
                "filepath": asset.location ?? "",
                "uri": "ph://" + asset.localIdentifier,
                "height": asset.pixelHeight,
                "width": asset.pixelWidth,
                "orientation": asset.pixelHeight > asset.pixelWidth ? 1 : 0
            ] as [String : Any]
        ]
        
        if let compressedURL = compressedURL {
            if var imageInfo = node["image"] as? [String: Any] {
                imageInfo["compressedUri"] = "file://" + compressedURL.path
                node["image"] = imageInfo
            }
        }
        
        
        return node
    }
    
    private func createVideoNode(asset: PHAsset, compressedURL: URL?) -> [String: Any] {
        var node: [String: Any] = [:]
        
        node = [
            "type": "video",
            "group_name": "",
            "video": [
                "filename": asset.value(forKey: "filename") as? String ?? "",
                "filepath": asset.location ?? "",
                "uri": "ph://" + asset.localIdentifier,
                "playableDuration": Int(asset.duration)
            ] as [String : Any]
        ]
        
        if let compressedURL = compressedURL {
            if var videoInfo = node["video"] as? [String: Any] {
                videoInfo["compressedUri"] = "file://" + compressedURL.path
                
                // Get the video track and its preferred transform
                let avAsset = AVAsset(url: compressedURL)
                let videoTrack = avAsset.tracks(withMediaType: .video).first
                let preferredTransform = videoTrack?.preferredTransform
                
                // Set the orientation based on the preferred transform
                if let transform = preferredTransform {
                    let angle = atan2(transform.b, transform.a)
                    let degrees = angle * CGFloat(180 / Double.pi)
                    videoInfo["orientation"] = degrees
                } else {
                    videoInfo["orientation"] = 0
                }
                
                node["video"] = videoInfo
            }
        }
        
        return node
    }



}

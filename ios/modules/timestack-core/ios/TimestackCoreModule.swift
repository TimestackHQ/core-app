import ExpoModulesCore
import React
import Photos
import UIKit

public class TimestackCoreModule: Module {

    public func definition() -> ModuleDefinition {
        
        Name("TimestackCore")
        
        Constants([
            "Name": "TimestackCore"
        ])
    
    
        View(TimestackCoreView.self) {
            Prop("name") { (view: TimestackCoreView, prop: String) in
                print(prop)
            }
        }
        
        AsyncFunction("fetchImages") {
            (pageNumber: Int, pageSize: Int) -> [String: Any] in
            
                var result = [Any]()
                let fetchOptions = PHFetchOptions()
                fetchOptions.includeAssetSourceTypes = .typeUserLibrary // Only fetch assets from user's library
                fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)] // Sort by creation date
                let startIndex = pageNumber * pageSize
                let endIndex = startIndex + pageSize
                let fetchResult: PHFetchResult = PHAsset.fetchAssets(with: fetchOptions)

                // Fetch assets for the current page
                let numAssets = fetchResult.count
                let range = startIndex..<min(endIndex, numAssets)
                fetchResult.enumerateObjects(at: IndexSet(integersIn: range)) { (asset, _, _) in
                    if let resource = PHAssetResource.assetResources(for: asset).first {
                        let node: [String: Any] = [
                            "type": asset.mediaType == .image ? "image" : "video",
                            "group_name": "",
                            "image": [
                                "filename": resource.originalFilename,
                                "filepath": asset.location ?? "",
                                "uri": "ph://"+resource.assetLocalIdentifier,
                                "height": asset.pixelHeight,
                                "width": asset.pixelWidth,
//                                "fileSize": a,
                                "playableDuration": Int(asset.duration),
                                "orientation": asset.pixelHeight > asset.pixelWidth ? 1 : 0
                            ],
                            "timestamp": Int(asset.creationDate?.timeIntervalSince1970 ?? 0),
                        
                        ]
                        result.append(node)
                    }
                }

                // Calculate the cursor for the next page of results
                let nextCursor = endIndex < numAssets ? pageNumber + 1 : nil

                // Return the results and cursor as a dictionary
                let outputDict: [String: Any] = ["media": result, "cursor": nextCursor ?? ""]
                return outputDict
            
        }
    }
      
}

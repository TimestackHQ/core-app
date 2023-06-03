import UIKit
import Photos
import ExpoModulesCore

class TimestackCoreView: ExpoView {
    private let collectionView: UICollectionView
    private var mediaItems: [PHAsset] = []
    private var selectedItems: [PHAsset] = []
    private let onMediaPicked = EventDispatcher()

    required init(appContext: AppContext? = nil) {
        let layout = UICollectionViewFlowLayout()
        layout.minimumLineSpacing = 1
        layout.minimumInteritemSpacing = 1
        layout.sectionInset = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
        let itemWidth = (UIScreen.main.bounds.width - 3) / 4 // Adjusted for 4 columns
        layout.itemSize = CGSize(width: itemWidth, height: itemWidth) // Same width and height
        
        collectionView = UICollectionView(frame: .zero, collectionViewLayout: layout)
        collectionView.backgroundColor = .white
        collectionView.register(MediaCell.self, forCellWithReuseIdentifier: "MediaCell")

        super.init(appContext: appContext)

        addSubview(collectionView)

        collectionView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            collectionView.topAnchor.constraint(equalTo: topAnchor),
            collectionView.leadingAnchor.constraint(equalTo: leadingAnchor),
            collectionView.trailingAnchor.constraint(equalTo: trailingAnchor),
            collectionView.bottomAnchor.constraint(equalTo: bottomAnchor)
        ])

        collectionView.dataSource = self
        collectionView.delegate = self

        fetchMediaItems()
    }


    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func fetchMediaItems() {
        let fetchOptions = PHFetchOptions()
        fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        let fetchResult: PHFetchResult = PHAsset.fetchAssets(with: fetchOptions)

        var assets: [PHAsset] = []
        var currentDate: Date? = nil

        fetchResult.enumerateObjects { asset, _, _ in
            let creationDate = asset.creationDate ?? Date()
            
            if currentDate == nil || !Calendar.current.isDate(currentDate!, inSameDayAs: creationDate) {
                currentDate = creationDate
            }
            
            assets.append(asset)
        }

        mediaItems = assets
        collectionView.reloadData()
    }

    
    private func onMediaPicked(_ itemDetails: [String: Any], picked: Bool) {
        onMediaPicked([
            "itemDetails": itemDetails,
            "picked": picked
        ])
    }
}


extension TimestackCoreView: UICollectionViewDataSource, UICollectionViewDelegate {
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return mediaItems.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let asset = mediaItems[indexPath.item]
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "MediaCell", for: indexPath) as! MediaCell
        let isSelected = selectedItems.contains(asset)
        cell.configure(with: asset, isSelected: isSelected)
        return cell
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let asset = mediaItems[indexPath.item]
        toggleSelection(for: asset)
        collectionView.reloadItems(at: [indexPath])
        
        let itemDetails: [String: Any] = [
            "type": asset.mediaType == .image ? "image" : "video",
            "group_name": "",
            "image": [
                "filename": asset.value(forKey: "filename") as? String ?? "",
                "filepath": asset.location ?? "",
                "uri": "ph://\(asset.localIdentifier)",
                "height": asset.pixelHeight,
                "width": asset.pixelWidth,
                "playableDuration": Int(asset.duration),
                "orientation": asset.pixelHeight > asset.pixelWidth ? 1 : 0
            ],
            "timestamp": Int(asset.creationDate?.timeIntervalSince1970 ?? 0)
        ]
                    
        let picked = selectedItems.contains(asset)
        onMediaPicked(itemDetails, picked: picked)
    }
    
    private func toggleSelection(for asset: PHAsset) {
        if selectedItems.contains(asset) {
            selectedItems.removeAll(where: { $0 == asset })
        } else {
            selectedItems.append(asset)
        }
    }
}

class MediaCell: UICollectionViewCell {
    private let imageView = UIImageView()
    private let selectionOverlayView = UIView()
    private let durationLabel = UILabel()

    override init(frame: CGRect) {
      super.init(frame: frame)
      setupImageView()
      setupSelectionOverlayView()
      setupDurationLabel()
    }

    required init?(coder: NSCoder) {
      super.init(coder: coder)
      setupImageView()
      setupSelectionOverlayView()
      setupDurationLabel()
    }
    
    private func setupImageView() {
        imageView.contentMode = .scaleAspectFill
        imageView.clipsToBounds = true
        contentView.addSubview(imageView)
        
        imageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            imageView.topAnchor.constraint(equalTo: contentView.topAnchor),
            imageView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            imageView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            imageView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor)
        ])
    }
    
    private func setupSelectionOverlayView() {
        selectionOverlayView.backgroundColor = .clear
        selectionOverlayView.isHidden = true
        contentView.addSubview(selectionOverlayView)

        selectionOverlayView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            selectionOverlayView.topAnchor.constraint(equalTo: contentView.topAnchor),
            selectionOverlayView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            selectionOverlayView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            selectionOverlayView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor)
        ])

        let selectionBackgroundView = UIView()
        selectionBackgroundView.backgroundColor = .white
        let iconRadius = contentView.bounds.width / 6.0 // Radius of the selection icon
        let backgroundSize = iconRadius * 2.0 / 3.0 // One-third of the selection icon's radius
        selectionBackgroundView.layer.cornerRadius = backgroundSize / 2.0
        selectionOverlayView.addSubview(selectionBackgroundView)

        selectionBackgroundView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            selectionBackgroundView.trailingAnchor.constraint(equalTo: selectionOverlayView.trailingAnchor, constant: -8),
            selectionBackgroundView.bottomAnchor.constraint(equalTo: selectionOverlayView.bottomAnchor, constant: -8),
            selectionBackgroundView.widthAnchor.constraint(equalToConstant: backgroundSize),
            selectionBackgroundView.heightAnchor.constraint(equalToConstant: backgroundSize)
        ])

        let selectionIcon = UIImageView(image: UIImage(systemName: "checkmark.circle.fill"))
        selectionIcon.contentMode = .scaleAspectFit
        selectionIcon.tintColor = .black
        selectionBackgroundView.addSubview(selectionIcon)

        selectionIcon.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            selectionIcon.centerXAnchor.constraint(equalTo: selectionBackgroundView.centerXAnchor),
            selectionIcon.centerYAnchor.constraint(equalTo: selectionBackgroundView.centerYAnchor),
            selectionIcon.widthAnchor.constraint(equalToConstant: iconRadius),
            selectionIcon.heightAnchor.constraint(equalToConstant: iconRadius)
        ])
    }




    
    private func setupDurationLabel() {
        durationLabel.textColor = .white
        durationLabel.font = UIFont(name: "RedHatDisplay-Regular", size: 12)
        durationLabel.layer.shadowColor = UIColor.black.cgColor
        durationLabel.layer.shadowOffset = CGSize(width: 0, height: 1)
        durationLabel.layer.shadowRadius = 2
        durationLabel.layer.shadowOpacity = 0.5
        durationLabel.textAlignment = .left
        durationLabel.isHidden = true
        contentView.addSubview(durationLabel)
        
        durationLabel.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            durationLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 4),
            durationLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -4)
        ])
    }
    
    func configure(with asset: PHAsset, isSelected: Bool) {
        selectionOverlayView.isHidden = !isSelected
        
        if asset.mediaType == .video {
            let durationString = stringFromTimeInterval(asset.duration)
            durationLabel.text = durationString
            durationLabel.isHidden = false
        } else {
            durationLabel.isHidden = true
        }
        
        // Check if the thumbnail image is already cached
        if let cachedImage = ImageCache.shared.retrieveImage(forKey: asset.localIdentifier) {
            imageView.image = cachedImage
        } else {
            let manager = PHImageManager.default()
            let options = PHImageRequestOptions()
            options.isSynchronous = false
            options.deliveryMode = .opportunistic
            options.resizeMode = .exact
            
            let targetSize = CGSize(width: frame.size.width * UIScreen.main.scale, height: frame.size.height * UIScreen.main.scale)
            
            // Request the thumbnail image
            manager.requestImage(for: asset, targetSize: targetSize, contentMode: .aspectFill, options: options) { [weak self] result, _ in
                if let image = result {
                    self?.imageView.image = image
                    // Cache the thumbnail image
                    ImageCache.shared.storeImage(image, forKey: asset.localIdentifier)
                }
            }
        }
    }


    
    private func stringFromTimeInterval(_ interval: TimeInterval) -> String {
        let formatter = DateComponentsFormatter()
        formatter.allowedUnits = [.minute, .second]
        formatter.zeroFormattingBehavior = .pad
        
        return formatter.string(from: interval) ?? ""
    }
    
    override func prepareForReuse() {
            super.prepareForReuse()
            selectionOverlayView.isHidden = true
        }
    
    
}

import UIKit
import Photos
import ExpoModulesCore

class TimestackCoreView: ExpoView {
    private let collectionView: UICollectionView
    private var mediaItems: [PHAsset] = []
    private var selectedItems: [PHAsset] = []
    private let onMediaPicked = EventDispatcher()
    public var selectedImages: [String] = []


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
        
        
        
        print("AppContent \(String(describing: appContext))")
        
        
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    public func setSelectedImages (selectedImagesList: [String]) {
        print("Selected Images List: \(selectedImagesList)")
        self.selectedImages = selectedImagesList
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
    
    private func isImageSelectable(_ asset: PHAsset) -> Bool {
        let assetURI = "ph://\(asset.localIdentifier)"
        return selectedImages.isEmpty || !selectedImages.contains(assetURI)
    }


    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let asset = mediaItems[indexPath.item]
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "MediaCell", for: indexPath) as! MediaCell
        let isSelected = selectedItems.contains(asset)
        let isSelectable = isImageSelectable(asset) // Replace `isImageSelectable` with your own logic to determine if the image is selectable
        cell.configure(with: asset, isSelected: isSelected, isSelectable: isSelectable)
        return cell
    }


    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let asset = mediaItems[indexPath.item]
        
        // Check if the selectedImages list is empty or if the asset's uri is present in selectedImages
        if selectedImages.isEmpty || !selectedImages.contains("ph://\(asset.localIdentifier)") {
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
                ] as [String : Any],
                "timestamp": Int(asset.creationDate?.timeIntervalSince1970 ?? 0)
            ]

            let picked = selectedItems.contains(asset)
            onMediaPicked(itemDetails, picked: picked)
        }
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
    private let durationLabel = UILabel()
    private let favoriteHeart = UIImageView()
    private let selectedIcon = UIImageView()
    private let circleIcon = UIImageView()
    private let selectedOverlayLayer = CALayer()

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupImageView()
        setupDurationLabel()
        setupFavoriteHeart()
        setupSelectedIcon()
        setupSelectedOverlayLayer()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupImageView()
        setupDurationLabel()
        setupFavoriteHeart()
        setupSelectedIcon()
        setupSelectedOverlayLayer()
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

    private func setupDurationLabel() {
        durationLabel.textColor = .white
        durationLabel.font = UIFont.systemFont(ofSize: 12)
        durationLabel.layer.shadowColor = UIColor.black.cgColor
        durationLabel.layer.shadowOffset = CGSize(width: 0, height: 2)
        durationLabel.layer.shadowRadius = 4
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

    private func setupFavoriteHeart() {
        favoriteHeart.image = UIImage(systemName: "heart.fill")?.withRenderingMode(.alwaysTemplate)
        favoriteHeart.contentMode = .scaleAspectFit
        favoriteHeart.tintColor = .white
        favoriteHeart.isHidden = true
        contentView.addSubview(favoriteHeart)

        favoriteHeart.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            favoriteHeart.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 4),
            favoriteHeart.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -4),
            favoriteHeart.widthAnchor.constraint(equalToConstant: 15),
            favoriteHeart.heightAnchor.constraint(equalToConstant: 15)
        ])
    }

    private func setupSelectedIcon() {
        let circleIconSize: CGFloat = 16

        circleIcon.image = UIImage(systemName: "circle.fill")
        circleIcon.contentMode = .center
        circleIcon.tintColor = .white
        circleIcon.backgroundColor = .clear
        circleIcon.layer.cornerRadius = circleIconSize / 2
        circleIcon.layer.masksToBounds = true
        selectedIcon.isHidden = true
        contentView.addSubview(circleIcon)

        circleIcon.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            circleIcon.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -8),
            circleIcon.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -8),
            circleIcon.widthAnchor.constraint(equalToConstant: circleIconSize),
            circleIcon.heightAnchor.constraint(equalToConstant: circleIconSize)
        ])

        selectedIcon.image = UIImage(systemName: "checkmark.circle.fill")
        selectedIcon.contentMode = .center
        selectedIcon.tintColor = .black
        selectedIcon.layer.cornerRadius = 9
        selectedIcon.layer.masksToBounds = true
        selectedIcon.isHidden = true
        contentView.addSubview(selectedIcon)

        selectedIcon.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            selectedIcon.centerXAnchor.constraint(equalTo: circleIcon.centerXAnchor),
            selectedIcon.centerYAnchor.constraint(equalTo: circleIcon.centerYAnchor),
            selectedIcon.widthAnchor.constraint(equalToConstant: 18),
            selectedIcon.heightAnchor.constraint(equalToConstant: 18)
        ])
    }

    private func setupSelectedOverlayLayer() {
        selectedOverlayLayer.backgroundColor = UIColor.black.cgColor
        selectedOverlayLayer.opacity = 0.8
        selectedOverlayLayer.isHidden = true
        contentView.layer.addSublayer(selectedOverlayLayer)
    }

    func configure(with asset: PHAsset, isSelected: Bool, isSelectable: Bool) {
        durationLabel.isHidden = asset.mediaType != .video
        favoriteHeart.isHidden = !asset.isFavorite

        // Remove any existing animations
        imageView.layer.removeAllAnimations()
        selectedIcon.layer.removeAllAnimations()
        circleIcon.layer.removeAllAnimations()
        selectedOverlayLayer.removeAllAnimations()

        // Update opacity and visibility
        self.imageView.alpha = isSelected ? 0.8 : 1.0
        self.selectedIcon.isHidden = !isSelected
        self.circleIcon.isHidden = !isSelected

        if isSelected || !isSelectable {
            selectedOverlayLayer.isHidden = true
        } else {
            selectedOverlayLayer.isHidden = false
        }

        if asset.mediaType == .video {
            let durationString = formattedDuration(asset.duration)
            durationLabel.text = durationString
        }

        if let cachedImage = ImageCache.shared.retrieveImage(forKey: asset.localIdentifier) {
            imageView.image = cachedImage
        } else {
            let manager = PHImageManager.default()
            let options = PHImageRequestOptions()
            options.isNetworkAccessAllowed = true
            manager.requestImage(for: asset, targetSize: imageView.bounds.size, contentMode: .aspectFill, options: options) { [weak self] image, _ in
                guard let self = self else { return }
                if let image = image {
                    self.imageView.image = image
                    ImageCache.shared.storeImage(image, forKey: asset.localIdentifier)
                }
            }
        }
    }

    private func formattedDuration(_ duration: TimeInterval) -> String {
        let formatter = DateComponentsFormatter()
        formatter.allowedUnits = duration < 3600 ? [.minute, .second] : [.hour, .minute, .second]
        formatter.zeroFormattingBehavior = .pad
        return formatter.string(from: duration) ?? ""
    }

    override func prepareForReuse() {
        super.prepareForReuse()
        durationLabel.text = ""
        favoriteHeart.isHidden = true
        selectedIcon.isHidden = true
        selectedOverlayLayer.isHidden = true
        imageView.alpha = 1.0
    }
}

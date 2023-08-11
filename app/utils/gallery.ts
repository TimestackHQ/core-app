import { MediaInternetType } from "@shared-types/*";

export const flattenGallery = (gallery: MediaInternetType[]) => {
    const flatGallery: MediaInternetType[] = [];

    gallery.forEach((media) => {


        if (media.isGroup) media.mediaList.forEach((mediaItemId, index) => flatGallery.push({
            ...media,
            _id: mediaItemId,
            isGroup: true,
            isPlaceholder: index !== 0,
            indexInGroup: index,
        }));
        else flatGallery.push({
            ...media,
            isPlaceholder: false,
            isGroup: false,
        });

    })

    return flatGallery;
}
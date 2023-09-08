import { storage } from '@/appwrite'

const getStorageImageUrl = async (image: Image) => {
  const url = storage.getFilePreview(image.bucketId, image.fileId)

  return url
}

export default getStorageImageUrl

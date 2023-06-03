package expo.modules.timestackcore

import android.content.Context
import android.graphics.Color
import android.provider.MediaStore
import android.view.Gravity
import android.view.View
import android.widget.*
import com.bumptech.glide.Glide
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import java.io.File

class TimestackCoreView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    private val NUM_COLUMNS = 4

    init {
        val galleryLayout = GridLayout(context)
        galleryLayout.columnCount = NUM_COLUMNS

        val mediaFiles = getAllMediaFiles(context)

        // Create the header view
        val headerView = createHeaderView(mediaFiles.size)
        galleryLayout.addView(headerView)

        for (file in mediaFiles) {
            val mediaView = createMediaView(file)
            galleryLayout.addView(mediaView)
        }

        addView(galleryLayout)
    }

    private fun getAllMediaFiles(context: Context): List<File> {
        val mediaFiles: MutableList<File> = mutableListOf()

        // Fetch image files
        val imageProjection = arrayOf(
                MediaStore.Images.Media.DATA
        )
        val imageCursor = context.contentResolver.query(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                imageProjection,
                null,
                null,
                null
        )
        imageCursor?.use { cursor ->
            val columnIndex = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA)
            while (cursor.moveToNext()) {
                val filePath = cursor.getString(columnIndex)
                val file = File(filePath)
                mediaFiles.add(file)
            }
        }

        // Fetch video files
        val videoProjection = arrayOf(
                MediaStore.Video.Media.DATA
        )
        val videoCursor = context.contentResolver.query(
                MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                videoProjection,
                null,
                null,
                null
        )
        videoCursor?.use { cursor ->
            val columnIndex = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA)
            while (cursor.moveToNext()) {
                val filePath = cursor.getString(columnIndex)
                val file = File(filePath)
                mediaFiles.add(file)
            }
        }

        return mediaFiles
    }

    private fun createHeaderView(totalMediaCount: Int): View {
        val headerLayout = LinearLayout(context)
        headerLayout.orientation = LinearLayout.VERTICAL
        headerLayout.gravity = Gravity.CENTER
        headerLayout.setBackgroundColor(Color.LTGRAY)

        val headerText = TextView(context)
        headerText.text = "Found $totalMediaCount media files"
        headerText.textSize = 16f
        headerText.setTextColor(Color.BLACK)

        headerLayout.addView(headerText)

        return headerLayout
    }

    private fun createMediaView(file: File): View {

        println(file)
        val mediaContainer = LinearLayout(context)
        mediaContainer.orientation = LinearLayout.VERTICAL

        val layoutParams = GridLayout.LayoutParams().apply {
            width = 0
            height = GridLayout.LayoutParams.WRAP_CONTENT
            columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
            setMargins(8, 8, 8, 8)
        }

        mediaContainer.layoutParams = layoutParams

        if (isImageFile(file)) {
            val imageView = ImageView(context)
            imageView.scaleType = ImageView.ScaleType.CENTER_CROP
            imageView.adjustViewBounds = true
            Glide.with(context)
                    .load(file)
                    .centerCrop()
                    .into(imageView)
            mediaContainer.addView(imageView)
        } else {
            val videoView = VideoView(context)
            videoView.setBackgroundColor(Color.BLACK)
            videoView.setVideoPath(file.absolutePath)
            videoView.start()
            mediaContainer.addView(videoView)
        }

        return mediaContainer
    }


    private fun isImageFile(file: File): Boolean {
        return file.extension.equals("jpg", true) ||
                file.extension.equals("jpeg", true) ||
                file.extension.equals("png", true)
    }
}

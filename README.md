# lookbook
high resolution (HR) lookbook to low resolution (LR) lookbook conversion 

**Lookbook Processing**

This is a guide to transferring High Resolution (HR) Lookbook photos to cropped, resized, <1.5MB images for the Low Resolution (LR) Lookbook.

**Crop / Resize & Export**

This section outlines the process of resizing all images from the HR Lookbook to the Hertrove site size standard (1281px x 1920px) in Adobe Illustrator, using a JavaScript file (**prep.jsx**) to automate the process.

Step 1:

Download the **prep.jsx** file to your computer

Step 2:

Open Adobe Illustrator.

Create a new file in Adobe Illustrator:

Set the # of Artboards to the # of images in the HR Lookbook.

Set the width of Artboard to 1281 px & height to 1920 px (portrait-orientation).

Press create.

Step 3:

**File** > **Place...** > then select HR Lookbook folder with the images you want to crop / resize / reformat. You will need to click each artboard individually to paste each image.

If images overlap on multiple artboards:

Go to **Object** > **Artboards** > **Rearrange Artboards**

Change the spacing to a larger value such as 2000 px

press **OK**

Step 4:

Go to **File** > **Scripts** > **Other Script...** > select **prep.jsx**

You should see each image resized and centered to each artboard individually

Step 5:

Make any shifts in alignment for your images if needed until satisfied with the arrangement

Step 6:

Go to **File** > **Export** > **Export for Screens...**

In the "**Export to:**" section, choose the file path to the folder in which you want to save all the reformatted images (you can select this manually by clicking on the folder icon).

Make sure to change the format to **JPG 100** in the **Formats: Format** section

**Resize**

The following portion of code can be copied and pasted into your computer's terminal to make sure all images are below 1.5 MB.

Step 1:

Open your computer's terminal (You may have to go to **Applications** \> **Terminal**)

Navigate to the folder in which you placed all your new files.

Copy and paste the following code into the terminal and hit enter:

**mkdir compressed**

**for f in \*.jpg; do**

**convert "\$f" -define jpeg:extent=1500kb "compressed/\$f"**

**done**

Note: You can ignore the following error message if it appears "_The convert command is deprecated in IMv7, use 'magick' instead of 'convert' or 'magick convert' is OKAY_"

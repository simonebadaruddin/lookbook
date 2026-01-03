# NEW Jewelry usage
**jewelresize.jsx** 
- Use jewelresize.jsx first, then export artboards from Photoshop directly
- Proceed to the Final section for maintaining all images are under the 1.5MB limit

# General usage
**resize.jsx** and **exportn.jsx** 
- Use resize.jsx first, then exportn.jsx to resize and export without needing to rename
- Proceed to the Next section for maintaining all images are under the 1.5MB limit
##
# **Manually Keep Images Below Size Limit Using the Terminal**

### Step 1:

Open your computer's terminal (**Applications** \> **Terminal**)

### Step 2:

Navigate to the folder in which you placed your new images. 
Do this by using the "cd" command followed by the path to the folder in which your photos are saved

     cd path/to/file

### Step 3:
Copy and paste the following code into the terminal & hit enter: 

     mkdir compressed

       for f in \*.jpg; do

     magick convert "\$f" -define jpeg:extent=1500kb "compressed/\$f"

     done



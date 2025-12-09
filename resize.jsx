#target photoshop
app.bringToFront();

// --- SETTINGS ---
var targetW = 1281;
var targetH = 1920;

// SELECT IMAGES
var files = File.openDialog(
    "Select images to resize & crop without stretching",
    "Images: *.jpg; *.jpeg; *.png; *.tif; *.tiff",
    true
);

if (!files) {
    alert("No files selected.");
    throw new Error("No files selected.");
}

function resizeToFill(doc, targetW, targetH) {

    // Step 1: Compute scale factor to FILL the frame (not fit)
    var w = doc.width.as("px");
    var h = doc.height.as("px");

    var scale = Math.max(targetW / w, targetH / h);

    // Step 2: Resize proportionally (NO distortion)
    doc.resizeImage(
        UnitValue(w * scale, "px"),
        UnitValue(h * scale, "px"),
        null,
        ResampleMethod.BICUBIC
    );

    // Step 3: Center crop to exact 1281 × 1920
    var left = (doc.width.as("px")  - targetW) / 2;
    var top  = (doc.height.as("px") - targetH) / 2;

    doc.crop([
        UnitValue(left, "px"),
        UnitValue(top, "px"),
        UnitValue(left + targetW, "px"),
        UnitValue(top + targetH, "px")
    ]);
}


// PROCESS IMAGES
for (var i = 0; i < files.length; i++) {

    var file = new File(files[i].fsName);
    var doc = app.open(file);

    resizeToFill(doc, targetW, targetH);

    // Leave open for manual edits
}

alert("All images are resized.\nYou may now manually adjust.\nRun the export script when finished.");

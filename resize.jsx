#target photoshop
app.bringToFront();

// SETTINGS
var targetW = 1281;
var targetH = 1920;

// SELECT IMAGES
var files = File.openDialog(
    "Select images to place into a 1281x1920 canvas",
    "Images: *.jpg; *.jpeg; *.png; *.tif; *.tiff",
    true
);

if (!files) {
    alert("No files selected.");
    throw new Error("No files selected.");
}

// Helper function to convert UnitValue to pixels
function px(v) { return v.as("px"); }

for (var i = 0; i < files.length; i++) {
    var file = new File(files[i].fsName);

    try {
        if (!file.exists) {
            alert("File does not exist: " + file.fsName);
            continue;
        }

        // Open source document
        var srcDoc = app.open(file);

        // Create destination document
        var cleanName = srcDoc.name.replace(/\.[^\.]+$/, "");
        var tgtDoc = app.documents.add(
            UnitValue(targetW, "px"),
            UnitValue(targetH, "px"),
            srcDoc.resolution,
            cleanName + "_1281x1920",
            NewDocumentMode.RGB,
            DocumentFill.TRANSPARENT
        );

        // Make source active before duplicating
        app.activeDocument = srcDoc;
        srcDoc.layers[0].duplicate(tgtDoc, ElementPlacement.PLACEATBEGINNING);

        // Close source without saving
        srcDoc.close(SaveOptions.DONOTSAVECHANGES);

        // Make target active
        app.activeDocument = tgtDoc;
        var layer = tgtDoc.activeLayer;

        // Get bounds
        var b = layer.bounds;
        var layerW = px(b[2]) - px(b[0]);
        var layerH = px(b[3]) - px(b[1]);

        // Compute scale factor to fill target without cropping
        var scaleFactor = Math.max(targetW / layerW, targetH / layerH) * 100;
        layer.resize(scaleFactor, scaleFactor, AnchorPosition.MIDDLECENTER);

        // Re-center
        var nb = layer.bounds;
        var cx = (px(nb[0]) + px(nb[2])) / 2;
        var cy = (px(nb[1]) + px(nb[3])) / 2;
        layer.translate(targetW / 2 - cx, targetH / 2 - cy);

    } catch (err) {
        alert("Error processing:\n" + file.fsName + "\n\n" + err.message);
    }
}

alert("All images are resized.\nYou may now manually adjust.\nRun the export script when finished.");

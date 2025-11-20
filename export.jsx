#target photoshop
app.bringToFront();

// --- SETTINGS ---
var jpegQuality = 12; // 0–12, 12 is max quality

// Make sure there is a document open
if (!app.documents.length) {
    alert("No document open. Please open your preview document first.");
    throw new Error("No document open.");
}

var doc = app.activeDocument;

// Ask user where to save exported JPGs
var outputFolder = Folder.selectDialog("Select folder to save JPGs");
if (!outputFolder) {
    alert("No folder selected. Exiting script.");
    throw new Error("No folder selected.");
}

// --- Hide background layer if it exists ---
var bgLayer = null;
for (var i = 0; i < doc.layers.length; i++) {
    if (doc.layers[i].name.toLowerCase() === "background") {
        bgLayer = doc.layers[i];
        bgLayer.visible = false;
        break;
    }
}

// Loop through layers
for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];

    // Skip background layer
    if (layer === bgLayer) continue;

    // Hide all other layers
    for (var j = 0; j < doc.layers.length; j++) {
        doc.layers[j].visible = false;
    }
    layer.visible = true;

    // Prepare export file
    var fileName = layer.name + ".jpg"; // layer name already includes SKU
    var jpgFile = new File(outputFolder + "/" + fileName);

    // Export visible layer as JPG
    var jpgOptions = new ExportOptionsSaveForWeb();
    jpgOptions.format = SaveDocumentType.JPEG;
    jpgOptions.includeProfile = false;
    jpgOptions.interlaced = false;
    jpgOptions.optimized = true;
    jpgOptions.quality = jpegQuality;

    doc.exportDocument(jpgFile, ExportType.SAVEFORWEB, jpgOptions);
}

// --- Open the folder automatically ---
outputFolder.execute();

alert("All layers exported successfully and folder opened.");

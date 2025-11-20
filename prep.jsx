#target photoshop
app.bringToFront();

// --- SETTINGS ---
var targetWidth = 1281;
var targetHeight = 1980;

// Prompt user for SKU
var sku = prompt("Enter the SKU", "");
if (!sku) {
    alert("No SKU entered. Exiting script.");
    throw new Error("No SKU entered.");
}

// Prompt user to select multiple images
var files = File.openDialog("Select your images", "Images:*.jpg;*.png;*.jpeg;*.tif;*.psd", true);
if (!files || files.length === 0) {
    alert("No files selected. Exiting script.");
    throw new Error("No files selected.");
}

// Create a single document to hold all images as layers
var doc = app.documents.add(targetWidth, targetHeight, 72, "Preview Images", NewDocumentMode.RGB, DocumentFill.WHITE);

// Function to place image as smart object
function placeImage(file) {
    var layerName = file.name.replace(/\.[^\.]+$/, "");

    // Place embedded image
    var idPlc = charIDToTypeID("Plc ");
    var desc = new ActionDescriptor();
    desc.putPath(charIDToTypeID("null"), file);
    desc.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
    var offsetDesc = new ActionDescriptor();
    offsetDesc.putUnitDouble(charIDToTypeID("Hrzn"), charIDToTypeID("#Pxl"), 0);
    offsetDesc.putUnitDouble(charIDToTypeID("Vrtc"), charIDToTypeID("#Pxl"), 0);
    desc.putObject(charIDToTypeID("Ofst"), charIDToTypeID("Ofst"), offsetDesc);
    executeAction(idPlc, desc, DialogModes.NO);

    var layer = doc.activeLayer;
    layer.name = layerName;

    // Resize to fill canvas completely (may crop edges)
    var layerW = layer.bounds[2].as("px") - layer.bounds[0].as("px");
    var layerH = layer.bounds[3].as("px") - layer.bounds[1].as("px");
    var scaleFactor = Math.max(targetWidth / layerW, targetHeight / layerH) * 100;
    layer.resize(scaleFactor, scaleFactor);

    // Center layer
    var layerWnew = layer.bounds[2].as("px") - layer.bounds[0].as("px");
    var layerHnew = layer.bounds[3].as("px") - layer.bounds[1].as("px");
    layer.translate(
        (targetWidth - layerWnew) / 2 - layer.bounds[0].as("px"),
        (targetHeight - layerHnew) / 2 - layer.bounds[1].as("px")
    );
}

// Loop through all files
for (var i = 0; i < files.length; i++) {
    placeImage(files[i]);
}

alert("All images placed. Please review each layer with the eye tool & make any neccessary adjustments before running the export script.");

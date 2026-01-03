#target photoshop
app.bringToFront();

/*
prep_artboards.jsx
Creates ONE document with ONE ARTBOARD PER IMAGE.
Each image is placed as an embedded smart object, resized to fill,
and each artboard is named using designer-season-item-type logic.
*/

var targetWidth = 1281;
var targetHeight = 1980;

// =================================================
// UI: Ask for designer, season, item numbers
// =================================================
function askDesignerSeasonAndItems() {
    var dlg = new Window('dialog', 'Designer, Season and Item Numbers');
    dlg.orientation = 'column';
    dlg.alignChildren = ['fill','top'];

    var g1 = dlg.add('group');
    g1.add('statictext', undefined, 'Designer:');
    var designerInput = g1.add('edittext', undefined, '');
    designerInput.characters = 10;

    g1.add('statictext', undefined, 'Season:');
    var seasonInput = g1.add('edittext', undefined, '');
    seasonInput.characters = 10;

    dlg.add('statictext', undefined, 'Item numbers (one per line):');
    var itemsBox = dlg.add('edittext', undefined, '', {multiline:true, scrolling:true});
    itemsBox.minimumSize = [400,200];

    var btns = dlg.add('group');
    btns.alignment = 'right';
    btns.add('button', undefined, 'OK').onClick = function() {
        if (!designerInput.text || !seasonInput.text || !itemsBox.text) {
            alert('Please fill everything.');
            return;
        }
        dlg.close(1);
    };
    btns.add('button', undefined, 'Cancel').onClick = function(){ dlg.close(0); };

    if (dlg.show() !== 1) return null;

    var items = itemsBox.text.replace(/\r/g,'\n').split('\n').filter(function(s){
        return s.replace(/\s+/g,'') !== '';
    });

    return {
        designer: designerInput.text.replace(/\s+/g,''),
        season: seasonInput.text.replace(/\s+/g,''),
        items: items
    };
}

// =================================================
// Helpers
// =================================================
function placeImage(file) {
    var idPlc = charIDToTypeID("Plc ");
    var desc = new ActionDescriptor();
    desc.putPath(charIDToTypeID("null"), file);
    desc.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
    executeAction(idPlc, desc, DialogModes.NO);
    return app.activeDocument.activeLayer;
}

function resizeAndCenter(layer) {
    var b = layer.bounds;
    var w = b[2].as('px') - b[0].as('px');
    var h = b[3].as('px') - b[1].as('px');

    var scale = Math.max(targetWidth/w, targetHeight/h) * 100;
    layer.resize(scale, scale, AnchorPosition.MIDDLECENTER);

    b = layer.bounds;
    var cx = (b[0].as('px') + b[2].as('px')) / 2;
    var cy = (b[1].as('px') + b[3].as('px')) / 2;
    layer.translate(targetWidth/2 - cx, targetHeight/2 - cy);
}

function askSelectItem(items, filename) {
    var dlg = new Window('dialog', 'Assign Item');
    dlg.add('statictext', undefined, filename);
    var dd = dlg.add('dropdownlist', undefined, items);
    dd.selection = 0;

    var g = dlg.add('group');
    g.add('button', undefined, 'OK').onClick = function(){ dlg.close(1); };
    g.add('button', undefined, 'Skip').onClick = function(){ dd.selection = null; dlg.close(1); };
    g.add('button', undefined, 'Cancel').onClick = function(){ dlg.close(0); };

    if (dlg.show() !== 1) return null;
    return dd.selection ? dd.selection.text : '__SKIP__';
}

function askType(label) {
    var types = ['F','B','S','C','Other','Skip'];
    var dlg = new Window('dialog','Type');
    dlg.add('statictext', undefined, label);
    var dd = dlg.add('dropdownlist', undefined, types);
    dd.selection = 0;

    var custom = dlg.add('edittext', undefined, '');
    custom.visible = false;
    dd.onChange = function(){ custom.visible = dd.selection.text === 'Other'; };

    dlg.add('button', undefined, 'OK').onClick = function(){ dlg.close(1); };

    if (dlg.show() !== 1) return null;
    if (dd.selection.text === 'Skip') return '__SKIP__';
    if (dd.selection.text === 'Other') return custom.text;
    return dd.selection.text;
}

// =================================================
// MAIN
// =================================================
var info = askDesignerSeasonAndItems();
if (!info) throw new Error('Cancelled');

var files = File.openDialog("Select images", "Images:*.*", true);
if (!files || !files.length) throw new Error('No files selected');

var doc = app.documents.add(
    targetWidth,
    targetHeight,
    72,
    "Artboard Prep",
    NewDocumentMode.RGB,
    DocumentFill.WHITE
);

// Enable artboards
doc.artboardsEnabled = true;

var counts = {};
info.items.forEach(function(i){ counts[i] = 0; });

var artboards = [];

for (var i = 0; i < files.length; i++) {

    // Create artboard
    var ab = doc.artboards.add([0,0,targetWidth,targetHeight]);
    doc.activeLayer = ab;
    ab.name = "TEMP";

    // Place image
    var layer = placeImage(files[i]);
    resizeAndCenter(layer);

    // Assign item
    var item = askSelectItem(info.items, files[i].name);
    if (item === null) throw new Error('Cancelled');

    if (item !== '__SKIP__') {
        counts[item]++;
        ab.name = info.designer + '-' + info.season + '-' + item + '-' + counts[item];
    } else {
        ab.name = info.designer + '-' + info.season + '-UNASSIGNED-' + (i+1);
    }

    artboards.push(ab);
}

// Type labeling
var typeCounts = {};
for (var a = 0; a < artboards.length; a++) {
    var ab = artboards[a];
    doc.activeLayer = ab;

    var t = askType(ab.name);
    if (!t || t === '__SKIP__') continue;

    typeCounts[ab.name] = (typeCounts[ab.name] || 0) + 1;
    ab.name = ab.name + '-' + t;
}

alert('All images placed into individual artboards.\nReady for export.');

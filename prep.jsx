/* * * * * * * * * * * * * * * * * * *
 *                                   *
 *    this file:                     *
 *                                   *
 *      resizes lookbook photos      *
 *      proportionally and sets      *
 *      height = 1920 px to fit      *
 *      each artboard perfectly      *
 *                                   *
 * * * * * * * * * * * * * * * * * * */

var doc = app.activeDocument;
var targetH = 1920; // target height in pixels

for (var i = 0; i < doc.artboards.length; i++) {
    doc.artboards.setActiveArtboardIndex(i);
    app.executeMenuCommand('selectallinartboard');
    var artRect = doc.artboards[i].artboardRect;
    var artW = artRect[2] - artRect[0];
    var artH = artRect[1] - artRect[3];

    if (doc.selection.length > 0) {
        var sel = doc.selection[0];
        var bounds = sel.visibleBounds;
        var w = bounds[2] - bounds[0];
        var h = bounds[1] - bounds[3];

        // scale proportionally to height = 1920px
        var scaleFactor = (targetH / h) * 10;

        // resize proportionally
        sel.resize(scaleFactor, scaleFactor);

        // get new bounds after resizing
        var newBounds = sel.visibleBounds;
        var newW = newBounds[2] - newBounds[0];
        var newH = newBounds[1] - newBounds[3];

        // center image on artboard
        var x = artRect[0] + (artW - newW) / 2;
        var y = artRect[1] - (artH - newH) / 2;
        sel.position = [x, y];
    }

    doc.selection = null;
}

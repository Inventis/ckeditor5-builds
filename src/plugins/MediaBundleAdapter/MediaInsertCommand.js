/**
 * @license Copyright (c) 2021, Inventis. All rights reserved.
 * For licensing, see LICENSE.
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import {findOptimalInsertionRange} from '@ckeditor/ckeditor5-widget/src/utils';

export default class MediaInsertCommand extends Command {
    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const schema = model.schema;

        this.isEnabled = isImageAllowedInParent( selection, schema, model ) && checkSelectionWithObject( selection, schema );
    }

    execute(options) {
        const editor = this.editor;

        editor.model.change(writer => {
            const mediaToInsert = Array.isArray(options.media) ? options.media : [options.media];

            for (const file of mediaToInsert) {
                insertMedia(writer, editor, file);
            }
        });
    }
}

// Handles uploading single file.
//
// @param {module:engine/model/writer~writer} writer
// @param {module:core/editor/editor~Editor} editor
// @param {File} file
function insertMedia(writer, editor, media)
{
    const doc = editor.model.document;

    let imageAttributes = {src: media.src, alt: media.name, caption: media.description};
    const srcSet = media.srcset && Array.isArray(media.srcset) ? media.srcset.join(',') : null;
    if (srcSet) {
        imageAttributes.srcset = srcSet;
    }
    const image = writer.createElement('image', imageAttributes);
    const caption = writer.createElement('caption');
    if (media.description) {
        writer.insert(writer.createText(media.description), caption);
    }
    writer.append(caption, image);

    const insertAtSelection = findOptimalInsertionRange(doc.selection, editor.model);

    editor.model.insertContent(image, insertAtSelection);

    // Inserting an image might've failed due to schema regulations.
    if (image.parent) {
        writer.setSelection(image, 'on');
    }
}

// Checks if image is allowed by schema in optimal insertion parent.
function isImageAllowedInParent( selection, schema, model )
{
    const parent = getInsertImageParent( selection, model );

    if (!parent) {
        return true;
    }

    return schema.checkChild( parent, 'image' );
}

// Additional check for when the command should be disabled:
// - selection is on object
// - selection is inside object
function checkSelectionWithObject( selection, schema )
{
    const selectedElement = selection.getSelectedElement();

    const isSelectionOnObject = !!selectedElement && schema.isObject( selectedElement );
    const isSelectionInObject = !![ ...selection.focus.getAncestors() ].find( ancestor => schema.isObject( ancestor ) );

    return !isSelectionOnObject && !isSelectionInObject;
}

// Returns a node that will be used to insert image with `model.insertContent` to check if image can be placed there.
function getInsertImageParent( selection, model )
{
    const insertionRange = findOptimalInsertionRange( selection, model );
    let parent = insertionRange.start.parent;

    if ( !parent.is( '$root' ) ) {
        parent = parent.parent;
    }

    return parent;
}

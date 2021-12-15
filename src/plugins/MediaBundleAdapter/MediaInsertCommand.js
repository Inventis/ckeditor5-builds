/**
 * @license Copyright (c) 2021, Inventis. All rights reserved.
 * For licensing, see LICENSE.
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

export default class MediaInsertCommand extends Command {
    refresh() {
        this.isEnabled = this.editor.plugins.get( 'ImageUtils' ).isImageAllowed();
    }

    execute(options) {
        const sourceDefinitions = parseMedia( options.media );
        const selection = this.editor.model.document.selection;
        const imageUtils = this.editor.plugins.get( 'ImageUtils' );

        // In case of multiple images, each image (starting from the 2nd) will be inserted at a position that
        // follows the previous one. That will move the selection and, to stay on the safe side and make sure
        // all images inherit the same selection attributes, they are collected beforehand.
        //
        // Applying these attributes ensures, for instance, that inserting an (inline) image into a link does
        // not split that link but preserves its continuity.
        //
        // Note: Selection attributes that do not make sense for images will be filtered out by insertImage() anyway.
        const selectionAttributes = Object.fromEntries( selection.getAttributes() );

        sourceDefinitions.forEach( ( sourceDefinition, index ) => {
            const selectedElement = selection.getSelectedElement();

            if ( typeof sourceDefinition === 'string' ) {
                sourceDefinition = { src: sourceDefinition };
            }

            // Inserting of an inline image replace the selected element and make a selection on the inserted image.
            // Therefore inserting multiple inline images requires creating position after each element.
            if ( index && selectedElement && imageUtils.isImage( selectedElement ) ) {
                const position = this.editor.model.createPositionAfter( selectedElement );

                imageUtils.insertImage( { ...sourceDefinition, ...selectionAttributes }, position );
            } else {
                imageUtils.insertImage( { ...sourceDefinition, ...selectionAttributes } );
            }
        } );
    }
}

function parseMedia( media ) {
    return media.map(item => ({
        src: item.src,
        alt: item.name,
        caption: media.description,
    }));
}

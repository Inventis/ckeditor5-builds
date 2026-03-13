/**
 * @license Copyright (c) 2021, Inventis. All rights reserved.
 * For licensing, see LICENSE.
 */
import {
    ClassicEditor as ClassicEditorBase,
    Essentials,
    Alignment,
    Autoformat,
    Bold,
    Italic,
    BlockQuote,
    Heading,
    HtmlEmbed,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    Indent,
    Link,
    LinkImage,
    List,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    Table,
    TableToolbar,
    Style,
    GeneralHtmlSupport,
} from 'ckeditor5';
import MediaBundleAdapter from './plugins/MediaBundleAdapter';

export default class ClassicEditor extends ClassicEditorBase {
}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
    Essentials,
    Alignment,
    Autoformat,
    Bold,
    Italic,
    BlockQuote,
    Heading,
    HtmlEmbed,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    Indent,
    MediaBundleAdapter,
    Link,
    LinkImage,
    List,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    Table,
    TableToolbar,
    Style,
    GeneralHtmlSupport
];

// Editor configuration.
ClassicEditor.defaultConfig = {
    licenseKey: 'GPL',
    toolbar: {
        items: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'indent',
            'outdent',
            '|',
            'mediaSelect',
            'blockQuote',
            'insertTable',
            'mediaEmbed',
            'undo',
            'redo'
        ]
    },
    htmlEmbed: {
        showPreviews: true,
    },
    image: {
        toolbar: [
            'imageStyle:block',
            'imageStyle:side',
            '|',
            'imageTextAlternative',
            '|',
            'linkImage'
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },
    link: {
        decorators: {
            openInNewTab: {
                mode: 'manual',
                label: 'Open in a new tab',
                attributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer'
                },
            },
        },
    },
    language: 'en',
};

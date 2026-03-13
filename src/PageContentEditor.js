/**
 * @license Copyright (c) 2021, Inventis. All rights reserved.
 * For licensing, see LICENSE.
 */
import {
    BalloonEditor,
    Essentials,
    Autoformat,
    Bold,
    Italic,
    Heading,
    Indent,
    Link,
    List,
    Paragraph,
    PasteFromOffice,
    Table,
    TableToolbar,
    Alignment,
    Underline,
    Subscript,
    Superscript,
    Style,
    GeneralHtmlSupport,
    CKEditorError,
    setDataInElement,
} from 'ckeditor5';

import './theme/overrides.css'

// These classes apply styling to the editable (the element the editor is activated on). We don't want that for our
// inline editor.
const editableClassesToRemove = ['ck-editor__editable', 'ck-rounded-corners', 'ck-editor__editable_inline']

export default class PageContentEditor extends BalloonEditor {
    constructor(sourceElementOrData, config = {}) {
        super(sourceElementOrData, config);

        if (config.isInline) {
            this.model.schema.extend('$root', {
                allowChildren: '$text'
            });
        }

        this.filterEditableClasses(this.ui.view, editableClassesToRemove);
    }

    static create(sourceElementOrData, config = {}) {
        return new Promise(resolve => {
            if (sourceElementOrData.tagName === 'TEXTAREA') {
                throw new CKEditorError('editor-wrong-element', null);
            }

            const editor = new this(sourceElementOrData, updateConfig(sourceElementOrData, config));
            resolve(editor.initPlugins()
                .then(() => editor.ui.init())
                .then(() => editor.data.init(editor.config.get('initialData')))
                .then(() => editor.fire('ready'))
                .then(() => editor));
        });
    }

    destroy() {
        // Cache the data, then destroy.
        // It's safe to assume that the model->view conversion will not work after super.destroy().
        const data = this.getData();

        this.ui.destroy();

        return super.destroy()
            .then(() => {
                if (this.sourceElement) {
                    setDataInElement(this.sourceElement, data);
                }
            });
    }

    filterEditableClasses(view, toRemove) {
        const currentClasses = view.editable.template.attributes['class'] || [];
        view.editable.template.attributes['class'] = currentClasses.filter(name => toRemove.indexOf(name) === -1);
    }
}

/**
 * Updates the provided config to ensure it is valid for the context it is going to be used in.
 *
 * @param {HTMLElement} sourceElement
 * @param {Object} config
 * @returns {Object}
 */
function updateConfig(sourceElement, config) {
    config = {
        ...structuredClone(PageContentEditor.defaultConfig),
        ...config,
    };
    const removePlugins = [];
    const removeToolbarItems = [];

    if (config.isInline === true) {
        removeToolbarItems.push('heading');
        removeToolbarItems.push('outdent');
        removeToolbarItems.push('indent');
    }

    // Disable the `link` option when `sourceElement` is nested inside a link. Don't use `instanceof` here as the
    // elements may come from a different window.
    if (isElementNestedIn(sourceElement, 'A')) {
        removeToolbarItems.push('link');
        removePlugins.push('Link');
    }

    config.removePlugins = [
        ...config.removePlugins || [],
        ...removePlugins,
    ];

    // The toolbar can be an array or an object, see
    // https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html#member-toolbar.
    // If it is an array, we convert to an object.
    if (Array.isArray(config.toolbar)) {
        config.toolbar = {
            items: config.toolbar,
        };
    } else if (config.toolbar === undefined) {
        config.toolbar = {};
    }

    config.toolbar.removeItems = [
        ...config.toolbar.removeItems || [],
        ...removeToolbarItems
    ];

    return config;
}

function isElementNestedIn(element, type) {
    let current = element;
    while (current.tagName !== type) {
        current = current.parentElement;
        if (current === null) {
            return false;
        }
    }
    return true;
}

// Plugins to include in the build.
PageContentEditor.builtinPlugins = [
    Essentials,
    Alignment,
    Autoformat,
    Bold,
    Italic,
    Underline,
    Heading,
    Indent,
    Link,
    List,
    Paragraph,
    PasteFromOffice,
    Subscript,
    Superscript,
    Table,
    TableToolbar,
    Style,
    GeneralHtmlSupport,
];

PageContentEditor.defaultConfig = {
    licenseKey: 'GPL',
    updateSourceElementOnDestroy: true,
    toolbar: {
        items: [
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            'link',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'subscript',
            'superscript',
            '|',
            'outdent',
            'indent'
        ]
    },

    heading: {
        options: [
            {model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph'},
            {model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2'},
            {model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3'},
            {model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4'},
            {model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5'},
            {model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6'}
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

    language: 'en'
}

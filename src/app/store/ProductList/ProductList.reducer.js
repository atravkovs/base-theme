/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import {
    APPEND_PAGE,
    UPDATE_PRODUCT_LIST_ITEMS,
    UPDATE_LOAD_STATUS
} from 'Store/ProductList';
import { getVariantsWithParams, getBrand } from 'Util/Product';

const initialState = {
    pages: {},
    isLoading: true
};

const ProductListReducer = (state = initialState, action) => {
    const {
        type,
        items: initialItems,
        currentPage,
        isLoading
    } = action;

    const items = initialItems && initialItems.reduce(((acc, item) => {
        const { attributes, configurable_options, variants: initialVariants } = item;

        // TODO: remove brand
        const brand = getBrand(attributes);
        const variants = initialVariants ? getVariantsWithParams(initialVariants, configurable_options) : undefined;

        return [
            ...acc,
            {
                ...item,
                brand,
                variants
            }
        ];
    }), []);

    switch (type) {
    case APPEND_PAGE:
        return {
            ...state,
            pages: {
                ...state.pages,
                [currentPage]: items
            }
        };

    case UPDATE_PRODUCT_LIST_ITEMS:
        return {
            ...state,
            isLoading: false,
            pages: {
                [currentPage]: items
            }
        };

    case UPDATE_LOAD_STATUS:
        return {
            ...state,
            isLoading
        };

    default:
        return state;
    }
};

export default ProductListReducer;

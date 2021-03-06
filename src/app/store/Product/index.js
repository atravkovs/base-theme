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

import ProductReducer from './Product.reducer';
import ProductDispatcher, {
    ProductDispatcher as ProductDispatcherClass
} from './Product.dispatcher';
import {
    UPDATE_PRODUCT_DETAILS,
    UPDATE_GROUPED_PRODUCT_QUANTITY,
    CLEAR_GROUPED_PRODUCT_QUANTITY,
    updateProductDetails,
    updateGroupedProductQuantity,
    clearGroupedProductQuantity
} from './Product.action';

export {
    ProductReducer,
    ProductDispatcher,
    ProductDispatcherClass,
    UPDATE_PRODUCT_DETAILS,
    UPDATE_GROUPED_PRODUCT_QUANTITY,
    CLEAR_GROUPED_PRODUCT_QUANTITY,
    updateProductDetails,
    updateGroupedProductQuantity,
    clearGroupedProductQuantity
};

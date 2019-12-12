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
import BrowserDatabase from 'Util/BrowserDatabase';
import { transformObjToFilters } from 'Util/Product';
import { UPDATE_RECENTLY_VIEWED_PRODUCTS } from 'Store/RecentlyViewedProducts';

export const RECENTLY_VIEWED_PRODUCTS = 'recentlyViewedProducts';

export const initialState = {
    recentlyViewedProducts: BrowserDatabase.getItem(RECENTLY_VIEWED_PRODUCTS) || []
};

export const NUMBER_OF_RECENT_PRODUCTS = 4;

export const RecentlyViewedProductsReducer = (state = initialState, action) => {
    switch (action.type) {
    case UPDATE_RECENTLY_VIEWED_PRODUCTS:
        const { recentlyViewedProducts } = state;
        const { product, product: { sku: newSku, type_id }, parameters } = action;

        // Shallow copy, in order not to change the state directly and allow re-render after change
        const cpRecentProducts = Array.from(recentlyViewedProducts);
        const parametersKVPairs = transformObjToFilters(parameters);

        const hasSimilar = cpRecentProducts.some(({ sku, selectedFilters }) => (
            newSku === sku
            && (
                type_id === 'simple'
                || JSON.stringify(parametersKVPairs) === JSON.stringify(selectedFilters)
            )
        ));

        if (hasSimilar) return state;

        const newRecentProduct = {
            ...product,
            selectedFilters: parametersKVPairs
        };

        cpRecentProducts.unshift(newRecentProduct);

        if (cpRecentProducts.length > NUMBER_OF_RECENT_PRODUCTS) {
            cpRecentProducts.splice(NUMBER_OF_RECENT_PRODUCTS - cpRecentProducts.length);
        }

        BrowserDatabase.setItem(cpRecentProducts, RECENTLY_VIEWED_PRODUCTS);
        return { ...state, recentlyViewedProducts: cpRecentProducts };

    default:
        return state;
    }
};

export default RecentlyViewedProductsReducer;

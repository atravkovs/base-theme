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

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import { BreadcrumbsDispatcher } from 'Store/Breadcrumbs';
import { CategoryDispatcher } from 'Store/Category';
import { toggleOverlayByKey } from 'Store/Overlay';
import { CategoryTreeType } from 'Type/Category';
import { changeHeaderState } from 'Store/Header';
import { PagesType } from 'Type/ProductList';
import { CATEGORY } from 'Component/Header';

import {
    ProductListDispatcher,
    updateLoadStatus as updateProductLoadStatus
} from 'Store/ProductList';

import {
    ProductListInfoDispatcher,
    updateInfoLoadStatus
} from 'Store/ProductListInfo';

import {
    getUrlParam,
    getQueryParam,
    setQueryParams,
    clearQueriesFromUrl,
    convertQueryStringToKeyValuePairs
} from 'Util/Url';

import CategoryPage from './CategoryPage.component';

export const mapStateToProps = state => ({
    category: state.CategoryReducer.category,
    pages: state.ProductListReducer.pages,
    isPagesLoading: state.ProductListReducer.isLoading,
    filters: state.ProductListInfoReducer.filters,
    totalItems: state.ProductListInfoReducer.totalItems,
    sortFields: state.ProductListInfoReducer.sortFields,
    minPriceRange: state.ProductListInfoReducer.minPrice,
    maxPriceRange: state.ProductListInfoReducer.maxPrice,
    isInfoLoading: state.ProductListInfoReducer.isLoading
});

export const mapDispatchToProps = dispatch => ({
    toggleOverlayByKey: key => dispatch(toggleOverlayByKey(key)),
    changeHeaderState: state => dispatch(changeHeaderState(state)),
    requestCategory: options => CategoryDispatcher.handleData(dispatch, options),
    updateBreadcrumbs: breadcrumbs => ((Object.keys(breadcrumbs).length)
        ? BreadcrumbsDispatcher.updateWithCategory(breadcrumbs, dispatch)
        : BreadcrumbsDispatcher.update([], dispatch)),
    requestProductList: options => ProductListDispatcher.handleData(dispatch, options),
    requestProductListInfo: options => ProductListInfoDispatcher.handleData(dispatch, options),
    updateLoadStatus: (options) => {
        dispatch(updateInfoLoadStatus(options));
        dispatch(updateProductLoadStatus(options));
    }
});

export class CategoryPageContainer extends PureComponent {
    constructor(props) {
        super(props);

        this.config = {
            pageSize: 12,
            defaultPriceRange: { min: 0, max: 300 },
            sortKey: 'name',
            sortDirection: 'ASC'
        };

        this.availableFunctions = {
            onSortChange: this.onSortChange.bind(this),
            getPageParams: this.getPageParams.bind(this),
            isNewCategory: this._isNewCategory.bind(this),
            getPriceRangeFromUrl: this.getPriceRangeFromUrl.bind(this),
            getSelectedFiltersFromUrl: this.getSelectedFiltersFromUrl.bind(this),
            requestPage: this.requestPage.bind(this),
            requestNextPage: this.requestNextPage.bind(this),
            updateFilter: this.updateFilter.bind(this),
            updatePriceRange: this.updatePriceRange.bind(this),
            updatePage: this.updatePage.bind(this),
            getSortFromUrl: this.getSortFromUrl.bind(this)
            // clearFilters: this._clearFilters.bind(this),
        };
    }

    componentDidMount() {
        const { updateBreadcrumbs, isOnlyPlaceholder, updateLoadStatus } = this.props;

        if (isOnlyPlaceholder) updateLoadStatus(true);

        // request data only if URL does not match loaded category
        if (this._isNewCategory()) {
            this._requestCategoryWithPageList();
            updateBreadcrumbs({});
        } else {
            this._onCategoryUpdate();
        }
    }

    componentDidUpdate(prevProps) {
        const { location, category: { id }, categoryIds } = this.props;
        const { category: { id: prevId }, categoryIds: prevCategoryIds } = prevProps;

        // update breadcrumbs only if category has changed
        if (id !== prevId) this._onCategoryUpdate();

        // update category only if route or search query has been changed
        if (this._urlHasChanged(location, prevProps) || categoryIds !== prevCategoryIds) {
            this._requestCategoryWithPageList(this._shouldChangeProductListInfo(location, prevProps));
        }
    }

    onSortChange(sortDirection, sortKey) {
        const { location, history } = this.props;

        setQueryParams({ sortKey }, location, history);
        setQueryParams({ sortDirection }, location, history);
    }

    getSearchParam() {
        const search = getQueryParam('search', location);
        return search ? decodeURIComponent(search) : '';
    }

    getPageParams() {
        const { totalItems, pages } = this.props;
        const { pageSize } = this.config;
        const pageFromUrl = getQueryParam('page', location) || 1;

        const totalPages = Math.ceil(totalItems / pageSize);
        const currentPage = parseInt(totalPages < pageFromUrl ? totalPages : pageFromUrl, 10);
        const productsLoaded = Object.values(pages).reduce((accumulator, page = []) => accumulator + page.length, 0);

        return { totalPages, currentPage, productsLoaded };
    }

    getPriceRangeFromUrl() {
        const { location } = this.props;
        const { defaultPriceRange: { min, max } } = this.config;
        const priceMinFromUrl = getQueryParam('priceMin', location);
        const priceMaxFromUrl = getQueryParam('priceMax', location);
        return { min: +priceMinFromUrl || min, max: +priceMaxFromUrl || max };
    }

    getSelectedFiltersFromUrl() {
        const { location } = this.props;
        const selectedFiltersString = (getQueryParam('customFilters', location) || '').split(';');
        return selectedFiltersString.reduce((acc, filter) => {
            if (!filter) return acc;
            const [key, value] = filter.split(':');
            return { ...acc, [key]: value.split(',') };
        }, {});
    }

    getSortFromUrl() {
        const { location } = this.props;
        const { sortKey: defaultSortKey, sortDirection: defaultSortDirection } = this.config;
        const sortDirection = getQueryParam('sortDirection', location) || defaultSortDirection;
        const sortKey = getQueryParam('sortKey', location) || defaultSortKey;
        return { sortDirection, sortKey };
    }

    _getCategoryUrlPath() {
        const { location, match } = this.props;
        const path = getUrlParam(match, location);
        return path.indexOf('search') === 0 ? null : path;
    }

    _getProductListOptions(currentPage, isNext) {
        const { categoryIds } = this.props;
        const { pageSize } = this.config;

        const categoryUrlPath = !categoryIds ? this._getCategoryUrlPath() : null;
        const customFilters = this.getSelectedFiltersFromUrl();
        const priceRange = this.getPriceRangeFromUrl();
        const search = this.getSearchParam();
        const sort = this.getSortFromUrl();

        return {
            categoryIds,
            categoryUrlPath,
            currentPage,
            customFilters,
            getConfigurableData: true,
            isNext,
            pageSize,
            priceRange,
            search,
            sort
        };
    }

    _onCategoryUpdate() {
        this._updateBreadcrumbs();
        this._updateHeaderState();
    }

    _updateBreadcrumbs() {
        const { category = {}, updateBreadcrumbs } = this.props;
        updateBreadcrumbs(category);
    }

    _updateHeaderState() {
        const { changeHeaderState, category: { name }, history } = this.props;

        changeHeaderState({
            name: CATEGORY,
            title: name,
            onBackClick: () => history.push('/')
        });
    }

    updateSearch(value) {
        const { location, history } = this.props;

        setQueryParams({
            search: value,
            page: ''
        }, location, history);
    }

    updatePage(pageNumber) {
        const { location, history } = this.props;

        setQueryParams({
            page: pageNumber === 1 ? '' : pageNumber
        }, location, history);
    }

    updatePriceRange(priceRange) {
        const { location, history } = this.props;

        setQueryParams({
            priceMax: priceRange.max,
            priceMin: priceRange.min,
            page: ''
        }, location, history);
    }

    updateFilter(filterName, filterArray) {
        const { location, history } = this.props;
        const prevCustomFilters = this.getSelectedFiltersFromUrl();

        prevCustomFilters[filterName] = filterArray;

        const customFiltersString = Object.entries(prevCustomFilters)
            .reduce((acc, [name, values]) => (!values.length
                ? acc
                : [...acc, `${ name }:${ values.sort().join(',') }`]
            ), []).sort().join(';');

        let customFilters;

        const hasTrailingSemicolon = customFiltersString[customFiltersString.length - 1] === ';';
        const hasLeadingSemicolon = customFiltersString[0] === ';';

        customFilters = hasTrailingSemicolon ? customFiltersString.slice(0, -1) : customFiltersString;
        customFilters = hasLeadingSemicolon ? customFilters.slice(1) : customFilters;

        setQueryParams({
            customFilters,
            page: ''
        }, location, history);
    }

    requestCategoryProductsInfo() {
        const { requestProductListInfo } = this.props;
        requestProductListInfo(this._getProductListOptions(1, false));
    }

    requestPage(pageNumber, isNext = false) {
        const { requestProductList } = this.props;
        requestProductList(this._getProductListOptions(pageNumber || 1, isNext));
    }

    requestNextPage(pageNumber) {
        this.requestPage(pageNumber, true);
    }

    _requestCategory() {
        const { categoryIds, isSearchPage, requestCategory } = this.props;
        const categoryUrlPath = !categoryIds ? this._getCategoryUrlPath() : null;

        requestCategory({
            categoryUrlPath,
            isSearchPage: isSearchPage || false,
            categoryIds
        });
    }

    _requestCategoryWithPageList(shouldRequestProductListInfo = true) {
        this._requestCategory();

        if (shouldRequestProductListInfo) {
            this.requestCategoryProductsInfo();
        }

        this.requestPage(getQueryParam('page', location) || 1);
    }

    _isNewCategory() {
        const { category: { url_path } = {} } = this.props;
        return url_path !== this._getCategoryUrlPath();
    }

    _compareQueriesWithFilter(search, prevSearch, filter) {
        const currentParams = filter(convertQueryStringToKeyValuePairs(search));
        const previousParams = filter(convertQueryStringToKeyValuePairs(prevSearch));
        return JSON.stringify(currentParams) === JSON.stringify(previousParams);
    }

    _compareQueriesWithoutSort(search, prevSearch) {
        return this._compareQueriesWithFilter(
            search, prevSearch, ({ sortKey, sortDirection, ...filteredParams }) => filteredParams
        );
    }

    _compareQueriesWithoutPage(search, prevSearch) {
        return this._compareQueriesWithFilter(
            search, prevSearch, ({ page, ...filteredParams }) => filteredParams
        );
    }

    _shouldChangeProductListInfo({ search }, { location: { search: prevSearch } }) {
        return this._isNewCategory() || !this._compareQueriesWithoutSort(search, prevSearch);
    }

    _urlHasChanged(location, prevProps) {
        const { pathname, search } = location;
        const { location: { pathname: prevPathname, search: prevSearch } } = prevProps;
        const pathnameHasChanged = pathname !== prevPathname;
        const searchQueryHasChanged = !this._compareQueriesWithoutPage(search, prevSearch);

        return pathnameHasChanged || searchQueryHasChanged;
    }

    _clearFilters() {
        const { location, history } = this.props;
        const { sortKey: defaultSortKey, sortDirection: defaultSortDirection } = this.config;

        const sortDirection = getQueryParam('sortDirection', location) || defaultSortDirection;
        const sortKey = getQueryParam('sortKey', location) || defaultSortKey;
        const page = getQueryParam('page', location) || 1;

        clearQueriesFromUrl(history);
        setQueryParams({ sortKey, sortDirection, page }, location, history);
    }

    render() {
        return (
            <CategoryPage
              { ...this.props }
              { ...this.availableFunctions }
            />
        );
    }
}

CategoryPageContainer.propTypes = {
    history: PropTypes.shape({
        location: PropTypes.object.isRequired,
        push: PropTypes.func.isRequired
    }).isRequired,
    category: CategoryTreeType.isRequired,
    pages: PagesType.isRequired,
    totalItems: PropTypes.number.isRequired,
    minPriceRange: PropTypes.number.isRequired,
    maxPriceRange: PropTypes.number.isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired
    }).isRequired,
    match: PropTypes.shape({
        path: PropTypes.string.isRequired
    }).isRequired,
    requestCategory: PropTypes.func.isRequired,
    changeHeaderState: PropTypes.func.isRequired,
    requestProductList: PropTypes.func.isRequired,
    requestProductListInfo: PropTypes.func.isRequired,
    updateBreadcrumbs: PropTypes.func.isRequired,
    updateLoadStatus: PropTypes.func.isRequired,
    filters: PropTypes.arrayOf(PropTypes.shape).isRequired,
    sortFields: PropTypes.shape({
        options: PropTypes.array
    }).isRequired,
    isInfoLoading: PropTypes.bool.isRequired,
    isPagesLoading: PropTypes.bool.isRequired,
    categoryIds: PropTypes.number,
    isOnlyPlaceholder: PropTypes.bool,
    isSearchPage: PropTypes.bool
};

CategoryPageContainer.defaultProps = {
    categoryIds: 0,
    isOnlyPlaceholder: false,
    isSearchPage: false
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryPageContainer);

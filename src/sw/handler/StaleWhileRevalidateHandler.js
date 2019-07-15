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
import Q from 'q';

const updateCache = (networkResponse, cache, url) => {
    const isValid = networkResponse.status === 200;
    if (isValid) {
        const responseToCache = networkResponse.clone();
        cache.put(url, responseToCache);
    }
};

const shouldBeRevalidated = (request, networkResponse) => {
    const type = request.headers.get('Application-Model');

    const responseClone = networkResponse.clone();
    responseClone.json().then((payload) => {
        const bc = new BroadcastChannel(type);
        bc.postMessage({ payload, type });
        bc.close();
    }, err => console.log(err));
};

const makeRespond = (event) => {
    const { request, request: url } = event;

    const networkRequest = fetch(request);

    const openCacheRequest = caches.open(self.CACHE_NAME);
    const cacheRequest = openCacheRequest
        .then(cache => cache.match(url));
    const cacheCheckedRequest = cacheRequest
        .then((result) => {
            if (result === undefined) throw Error('Cache does not exist');

            return result;
        });

    if (request.method !== 'POST') {
        Promise.all([networkRequest, openCacheRequest, cacheRequest])
            .then(([networkResponse, cache, cachedResponse]) => {
                updateCache(networkResponse, cache, url);

                if (cachedResponse) shouldBeRevalidated(request, networkResponse);
            });
    }

    return Q.any([networkRequest, cacheCheckedRequest]);
};

const StaleWhileRevalidateHandler = (event) => {
    event.respondWith(makeRespond(event));
};

export default StaleWhileRevalidateHandler;

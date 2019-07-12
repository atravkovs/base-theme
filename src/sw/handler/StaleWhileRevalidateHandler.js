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

const makeRequestAndUpdateCache = (request, cache) => fetch(request).then((response) => {
    const isValid = response.status === 200;
    const responseToCache = response.clone();
    if (isValid) cache.put(request.url, responseToCache);
    return response;
});

const updateCache = (networkResponse, cache, url) => {
    const isValid = networkResponse.status === 200;
    const responseToCache = networkResponse.clone();
    if (isValid) cache.put(url, responseToCache);
};

const shouldBeRevalidated = (request, cache) => {
    const type = request.headers.get('Application-Model');

    makeRequestAndUpdateCache(request, cache)
        .then((response) => {
            const responseClone = response.clone();
            responseClone.json().then((payload) => {
                const bc = new BroadcastChannel(type);
                bc.postMessage({ payload, type });
                bc.close();
            }, err => console.log(err));
        }, err => console.log(err));

    return true;
};

const makeRespond = (event) => {
    const { request, request: url } = event;

    const networkRequest = fetch(request)
        .catch(error => ({
            caused: 'network',
            error
        }));

    const openCacheRequest = caches.open(self.CACHE_NAME);
    const cacheRequest = openCacheRequest
        .then(cache => cache.match(url))
        .catch(error => ({
            caused: 'cache',
            error
        }));

    Promise.all([networkRequest, openCacheRequest, cacheRequest]).then(([networkResponse, cache, cachedResponse]) => {
        updateCache(networkResponse, cache, url);

        // if (cachedResponse) shouldBeRevalidated(request, cache);
    });

    return Promise.race([networkRequest, cacheRequest])
        .then(result => (result === undefined ? networkRequest : result))
        .catch(({ caused }) => (caused === 'network' ? cacheRequest : networkRequest));
};

const StaleWhileRevalidateHandler = (event) => {
    event.respondWith(makeRespond(event));
};

export default StaleWhileRevalidateHandler;

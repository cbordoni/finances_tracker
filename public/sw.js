var CACHE_NAME = 'app_finances_cache_v1';

var CACHE_URLS = ['/', '/styles/app.css', '/js/app.js', '/js/chart.min.js'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('Caching URLs');
			return cache.addAll(CACHE_URLS);
		})
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			// caches.match() always resolves
			// but in case of success response will have value
			if (response) {
				return response;
			} else {
				return fetch(event.request)
					.then((response) => {
						// Check if we received a valid response
						if (!response || response.status !== 200 || response.type !== 'basic') {
							return response;
						}

						// Cloning the response since it's a stream as well.
						// Because we want the browser to consume the response
						// as well as the cache consuming the response, we need
						// to clone it so we have two streams.
						var responseToCache = response.clone();

						caches.open(CACHE_NAME).then(function (cache) {
							// Add the request to the cache for future queries.
							cache.put(event.request, responseToCache);
						});

						return response;
					})
					.catch(function (e) {
						console.log(e);
					});
			}
		})
	);
});

self.addEventListener('activate', function (event) {
	// var cacheWhitelist = ['page-1', 'page-2'];

	event.waitUntil(
		// Retrieving all the keys from the cache.
		caches.keys().then(function (cacheNames) {
			return Promise.all(
				// Looping through all the cached files.
				cacheNames.map(function (cacheName) {
					// If the file in the cache is not in the whitelist
					// it should be deleted.

					console.log(cacheName);

					// if (cacheWhitelist.indexOf(cacheName) === -1) {
					// 	return caches.delete(cacheName);
					// }
				})
			);
		})
	);
});

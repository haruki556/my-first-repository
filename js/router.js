export class Router {
    constructor(routes, rootElem) {
        this.routes = routes;
        this.rootElem = rootElem;
        this.currentView = null;
        
        // Listen to hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    init() {
        if (!window.location.hash) {
            window.location.hash = '#/';
        }
        this.handleRoute();
        
        // --- REAL TIME SYNC: Auto re-render view when cloud data changes ---
        window.addEventListener('store-updated', () => {
            // Prevent input wiping if user is typing? Actually, since it's a simple app,
            // re-rendering will update all data instantly.
            if (this.currentView && typeof this.currentView.render === 'function') {
                this.currentView.render(this.rootElem);
                // Re-initialize icons
                setTimeout(() => lucide.createIcons(), 50);
            }
        });
    }

    async handleRoute() {
        const path = window.location.hash.slice(1) || '/';
        const route = this.routes[path] || this.routes['/'];
        
        // Clean up current view if has destroy method
        if (this.currentView && typeof this.currentView.destroy === 'function') {
            this.currentView.destroy();
        }

        // Run the view function and get HTML
        this.currentView = route;
        
        // Update Title
        document.getElementById('page-title').textContent = route.title;
        
        // Update Nav Active State
        document.querySelectorAll('.nav-item').forEach(el => {
            if(el.getAttribute('data-route') === path) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        // Trigger fade out/in animation hack
        this.rootElem.style.animation = 'none';
        this.rootElem.offsetHeight; /* trigger reflow */
        this.rootElem.style.animation = null;

        await route.render(this.rootElem);
        
        // Re-initialize Lucide icons for new content
        lucide.createIcons();
    }
}

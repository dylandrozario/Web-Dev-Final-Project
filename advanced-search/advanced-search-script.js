function initializeFilters() {
    const filterHeaders = document.querySelectorAll('.filter-header');
    
    filterHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('data-expanded') === 'true';
            const targetId = header.getAttribute('data-target');
            const filterContent = document.getElementById(targetId);
            
            if (filterContent) {
                if (isExpanded) {
                    header.setAttribute('data-expanded', 'false');
                    filterContent.hidden = true;
                } else {
                    header.setAttribute('data-expanded', 'true');
                    filterContent.hidden = false;
                }
            }
        });
    });
}

function initializeSearch() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.getElementById('search-input');
    const dropdownButton = document.querySelector('.dropdown-button');
    
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                performSearch(searchTerm);
            }
        });
    }
    
    // Dropdown functionality (basic - can be expanded)
    if (dropdownButton) {
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // Could add dropdown menu here
            console.log('Search category dropdown clicked');
        });
    }
}

function performSearch(searchTerm) {
    console.log('Searching for:', searchTerm);
    // This would typically filter the book results
    // For now, just log the search term
}

function initializeCart() {
    const cartButton = document.querySelector('.cart-button');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-icon');
    const cartBadge = document.querySelector('.cart-count');
    let cartCount = 0; 
    
    // Update cart badge
    function updateCartBadge() {
        if (cartBadge) {
            cartBadge.textContent = cartCount;
            if (cartCount === 0) {
                cartBadge.style.display = 'none';
            } else {
                cartBadge.style.display = 'flex';
            }
        }
    }
    
    // Add to cart functionality
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            cartCount++;
            updateCartBadge();
            
            
            button.style.transform = 'scale(1.2)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 200);
        });
    });
    

    if (cartButton) {
        cartButton.addEventListener('click', () => {
            console.log('Cart clicked - would open cart modal/page');
        });
    }
    

    updateCartBadge();
}

const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        const sortValue = e.target.value;
        console.log('Sorting by:', sortValue);
        // This would typically sort the book results
        // For now, just log the sort value
    });
}

const filterCheckboxes = document.querySelectorAll('.filter-content input[type="checkbox"]');
filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        // This would typically filter the book results
        console.log('Filter changed:', checkbox.value, checkbox.checked);
    });
});
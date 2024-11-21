let products = [];

const loadDishes = async () => {
    try {
        const response = await fetch("https://edu.std-900.ist.mospolytech.ru/labs/api/dishes");
        const data = await response.json();
        products = data;
        renderDishes();  
    } catch (error) {
        console.error("Ошибка при загрузке блюд:", error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const sections = {
        soup: document.querySelector('.soups .gridContainer'),
        maindish: document.querySelector('.maindishes .gridContainer'),
        drink: document.querySelector('.drinks .gridContainer'),
        salad: document.querySelector('.salads .gridContainer'),
        dessert: document.querySelector('.desserts .gridContainer'),
    };

    const orderInfo = {
        selectedSoup: null,
        selectedMainDish: null,
        selectedSalad: null,
        selectedDrink: null,
        selectedDessert: null,
    };

    document.querySelector('.buttonForm1').addEventListener('click', () => {
        orderInfo.selectedSoup = null;
        orderInfo.selectedMainDish = null;
        orderInfo.selectedSalad = null;
        orderInfo.selectedDrink = null;
        orderInfo.selectedDessert = null;
    
        updateOrderDisplay();

        document.querySelector('.selectedSoup').textContent = 'Блюдо не выбрано';
        document.querySelector('.selectedMaindish').textContent = 'Блюдо не выбрано';
        document.querySelector('.selectedSalad').textContent = 'Блюдо не выбрано';
        document.querySelector('.selectedDrink').textContent = 'Блюдо не выбрано';
        document.querySelector('.selectedDessert').textContent = 'Блюдо не выбрано';
    

        document.querySelectorAll('.orderCategory').forEach(category => {
            category.style.display = 'block';
        });
    
        const totalPriceEl = document.querySelector('.totalPrice');
        totalPriceEl.textContent = '';
        totalPriceEl.style.display = 'none';
    });
    
    function renderDishes() {
        const soups = products.filter(product => product.category === 'soup');
        const maindishes = products.filter(product => product.category === 'main-course');
        const salads = products.filter(product => product.category === 'salad');
        const drinks = products.filter(product => product.category === 'drink');
        const desserts = products.filter(product => product.category === 'dessert');

        displayProducts(soups, sections.soup);
        displayProducts(maindishes, sections.maindish);
        displayProducts(salads, sections.salad);
        displayProducts(drinks, sections.drink);
        displayProducts(desserts, sections.dessert);
    }

    function displayProducts(products, section) {
        section.innerHTML = ''; 
        products.forEach(product => {
            const dishDiv = document.createElement('div');
            dishDiv.classList.add('dish');
            dishDiv.setAttribute('dataDish', product.keyword);
            dishDiv.setAttribute('dataKind', product.kind);
            dishDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}"/>
                <p class="price">${product.price} ₽</p>
                <p class="name">${product.name}</p>
                <p class="weight">${product.weight}</p>
                <button class="addToOrder">Добавить</button>
            `;
            section.appendChild(dishDiv);
        });
        attachEventListeners();
    }


    document.querySelectorAll(".categoryButtons button").forEach(filterButton => {
        filterButton.addEventListener("click", (event) => {
            const section = event.target.closest("section");
            const previouslyActive = section.querySelector(".categoryButtons button.active");
            
            if (previouslyActive === event.target) {
                event.target.classList.remove("active");
                filterDishes(section, "all");
            } else {
                section.querySelectorAll(".categoryButtons button").forEach(btn => btn.classList.remove("active"));
                event.target.classList.add("active");
                const kind = event.target.classList[0];
                filterDishes(section, kind);
            }
        });
    });

    const filterDishes = (section, kind) => {
        const sectionDishes = section.querySelectorAll(".dish");
        sectionDishes.forEach(dishElement => {
            const dishKind = dishElement.getAttribute("dataKind");
            if (kind === "all" || dishKind === kind) {
                dishElement.style.display = "block";
            } else {
                dishElement.style.display = "none";
            }
        });
    };

    function attachEventListeners() {
        const dishButtons = document.querySelectorAll('.addToOrder');
        dishButtons.forEach(button => {
            button.addEventListener('click', () => {
                const dishDiv = button.parentElement;
                const name = dishDiv.querySelector('.name').textContent;
                const price = parseFloat(dishDiv.querySelector('.price').textContent);
                const category = getCategory(dishDiv);

                updateOrderInfo(category, name, price);
                updateOrderDisplay();
            });
        });
    }

    function getCategory(dishDiv) {
        if (dishDiv.closest('.soups')) return 'soup';
        if (dishDiv.closest('.maindishes')) return 'maindish';
        if (dishDiv.closest('.salads')) return 'salad';
        if (dishDiv.closest('.drinks')) return 'drink';
        if (dishDiv.closest('.desserts')) return 'dessert';
    }

    function updateOrderInfo(category, name, price) {
        switch (category) {
            case 'soup':
                orderInfo.selectedSoup = { name, price };
                break;
            case 'maindish':
                orderInfo.selectedMainDish = { name, price };
                break;
            case 'salad':
                orderInfo.selectedSalad = { name, price };
                break;
            case 'drink':
                orderInfo.selectedDrink = { name, price };
                break;
            case 'dessert':
                orderInfo.selectedDessert = { name, price };
                break;
        }
    }

    const checkLunchComposition = () => {
        const selectedCategories = Object.keys(orderInfo).filter(
            key => orderInfo[key] !== null // 
        ).map(key => {
            if (key === "selectedSoup") return "soup";
            if (key === "selectedMainDish") return "maindish";
            if (key === "selectedSalad") return "salad";
            if (key === "selectedDrink") return "drink";
            if (key === "selectedDessert") return "dessert";
        });
    
        const validCombos = [
            ["soup", "maindish", "salad", "drink"],
            ["salad", "maindish", "drink"],
            ["soup", "salad", "drink"],
            ["maindish", "salad", "drink"],
            ["maindish", "drink"],
        ];
    
        const isValidCombo = validCombos.some(combo =>
            combo.every(item => selectedCategories.includes(item))
        );

        if (isValidCombo) {
            //showAlert("...")
            return true; 
        }
        else if (selectedCategories.length === 0) {
            showAlert("Ничего не выбрано. Выберите блюда для заказа");
            return false;
        } else if (selectedCategories.includes("dessert") && selectedCategories.length === 1) {
            showAlert("Выберите главное блюдо");
            return false;
        } else if (
            selectedCategories.includes("maindish") &&
            selectedCategories.includes("salad") &&
            !selectedCategories.includes("drink") &&
            selectedCategories.includes("soup")
        ) {
            showAlert("Выберите напиток");
            return false;
        } else if (
            selectedCategories.includes("soup") &&
            !selectedCategories.includes("maindish") &&
            !selectedCategories.includes("salad")
        ) {
            showAlert("Выберите главное блюдо, салат или стартер");
            return false;
        } else if (
            selectedCategories.includes("salad") &&
            !selectedCategories.includes("soup") &&
            !selectedCategories.includes("maindish")
        ) {
            showAlert("Выберите суп или главное блюдо");
            return false;
        } else if (
            selectedCategories.includes("drink") &&
            !selectedCategories.includes("maindish") &&
            !selectedCategories.includes("salad")
        ) {
            showAlert("Выберите главное блюдо");
            return false;
        } /*else if (!isValidCombo) {
            showAlert("Выберите все необходимые блюда для заказа");
            return false;
        }*/
    };

    const showAlert = (message) => {
        if (document.querySelector(".alert")) {
            return; 
        }

        const alertBox = document.createElement("div");
        alertBox.classList.add("alert"); 
        alertBox.innerHTML = `
            <div class="alertContent">
                <p>${message}</p>
                <button class="closeAlert">Окей 👌</button>
            </div>
        `;

    
        document.body.style.overflow = "hidden";

        document.body.appendChild(alertBox);

        const closeButton = alertBox.querySelector(".closeAlert");
        closeButton.addEventListener("click", () => {
            alertBox.remove(); 
            document.body.style.overflow = ""; 
        });
    };

    document.querySelector('.buttonForm2').addEventListener('click', (event) => {
        event.preventDefault(); //
    
        if (checkLunchComposition()) {
            console.log("Заказ отправлен!"); 
        } else {
            console.log("Не удалось отправить заказ. Проверьте состав.");
        }
    });

    function updateOrderDisplay() {
        const selectedSoupEl = document.querySelector('.selectedSoup');
        const selectedMainDishEl = document.querySelector('.selectedMaindish');
        const selectedSaladEl = document.querySelector('.selectedSalad');
        const selectedDrinkEl = document.querySelector('.selectedDrink');
        const selectedDessertEl = document.querySelector('.selectedDessert');
        const totalPriceEl = document.querySelector('.totalPrice');
    
        const isAnythingSelected = orderInfo.selectedSoup || orderInfo.selectedMainDish || orderInfo.selectedSalad || orderInfo.selectedDrink || orderInfo.selectedDessert;
    
        document.querySelectorAll('.orderCategory').forEach(category => {
            category.style.display = isAnythingSelected ? 'block' : 'none';
        });
    
        selectedSoupEl.textContent = orderInfo.selectedSoup ? `${orderInfo.selectedSoup.name} ${orderInfo.selectedSoup.price}₽` : 'Блюдо не выбрано';
        selectedMainDishEl.textContent = orderInfo.selectedMainDish ? `${orderInfo.selectedMainDish.name} ${orderInfo.selectedMainDish.price}₽` : 'Блюдо не выбрано';
        selectedSaladEl.textContent = orderInfo.selectedSalad ? `${orderInfo.selectedSalad.name} ${orderInfo.selectedSalad.price}₽` : 'Блюдо не выбрано';
        selectedDrinkEl.textContent = orderInfo.selectedDrink ? `${orderInfo.selectedDrink.name} ${orderInfo.selectedDrink.price}₽` : 'Блюдо не выбрано';
        selectedDessertEl.textContent = orderInfo.selectedDessert ? `${orderInfo.selectedDessert.name} ${orderInfo.selectedDessert.price}₽` : 'Блюдо не выбрано';

        const totalPrice = (orderInfo.selectedSoup?.price || 0) + (orderInfo.selectedMainDish?.price || 0) + (orderInfo.selectedSalad?.price || 0) + (orderInfo.selectedDrink?.price || 0) + (orderInfo.selectedDessert?.price || 0);
        totalPriceEl.textContent = `Стоимость заказа: ${totalPrice} ₽`;
    
        if (!isAnythingSelected) {
            selectedSoupEl.textContent = 'Блюдо не выбрано';
            selectedMainDishEl.textContent = 'Блюдо не выбрано';
            selectedSaladEl.textContent = 'Блюдо не выбрано';
            selectedDrinkEl.textContent = 'Блюдо не выбрано';
            selectedDessertEl.textContent = 'Блюдо не выбрано';
            totalPriceEl.style.display = 'none';
        } else {
            totalPriceEl.style.display = 'block';
        }
    }
    
    renderDishes();
    loadDishes();
});

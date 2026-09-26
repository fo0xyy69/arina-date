```text
// Адрес твоего Cloudflare Worker
const API_URL = "https://arina-date-telegram.strygin647.workers.dev";

// Храним выбор Ариши
const choices = {
    date: "",
    time: "",
    activities: [],
    food: [],
    customFood: ""
};


// Переход между экранами
function nextScreen(screenId) {
    document.querySelectorAll(".screen").forEach(function(screen) {
        screen.classList.remove("active");
    });

    const target = document.getElementById(screenId);

    if (target) {
        target.classList.add("active");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}


// Выбор даты
document.querySelectorAll(".date-option").forEach(function(button) {
    button.addEventListener("click", function() {

        document.querySelectorAll(".date-option").forEach(function(item) {
            item.classList.remove("selected");
        });

        button.classList.add("selected");

        choices.date = button.dataset.value;

        document.getElementById("date-next").disabled = false;
    });
});


// Выбор времени
document.querySelectorAll(".time-option").forEach(function(button) {
    button.addEventListener("click", function() {

        document.querySelectorAll(".time-option").forEach(function(item) {
            item.classList.remove("selected");
        });

        button.classList.add("selected");

        choices.time = button.dataset.value;

        document.getElementById("time-next").disabled = false;
    });
});


// Переход к времени
function goToTime() {
    if (!choices.date) {
        return;
    }

    nextScreen("screen-time");
}


// Переход к занятиям
function goToActivity() {
    if (!choices.time) {
        return;
    }

    nextScreen("screen-activity");
}


// Переход к еде
function goToFood() {
    if (choices.activities.length === 0) {
        return;
    }

    nextScreen("screen-food");
}


// Открытие / закрытие категории
function toggleCategory(categoryId, button) {

    const category = document.getElementById(categoryId);

    if (!category) {
        return;
    }

    const isOpen = category.classList.contains("open");

    category.classList.toggle("open");
    button.classList.toggle("open");

    if (!isOpen) {
        category.style.display = "grid";
    } else {
        category.style.display = "none";
    }
}


// Выбор занятий
// Можно выбрать несколько
document.querySelectorAll(".activity-option").forEach(function(button) {

    button.addEventListener("click", function() {

        const value = button.dataset.value;

        if (button.classList.contains("selected")) {

            button.classList.remove("selected");

            choices.activities = choices.activities.filter(function(item) {
                return item !== value;
            });

        } else {

            button.classList.add("selected");

            choices.activities.push(value);
        }

        updateActivityButton();
    });
});


function updateActivityButton() {

    const button = document.getElementById("activity-next");

    if (choices.activities.length > 0) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}


// Выбор еды
// Можно выбрать несколько
document.querySelectorAll(".food-option").forEach(function(button) {

    button.addEventListener("click", function() {

        const value = button.dataset.value;

        if (button.classList.contains("selected")) {

            button.classList.remove("selected");

            choices.food = choices.food.filter(function(item) {
                return item !== value;
            });

            if (value === "Твой выбор") {
                hideCustomFood();
            }

        } else {

            button.classList.add("selected");

            choices.food.push(value);

            if (value === "Твой выбор") {
                showCustomFood();
            }
        }

        updateFinishButton();
    });
});


// Поле "Твой выбор"
const customFoodInput = document.getElementById("custom-food-input");

if (customFoodInput) {

    customFoodInput.addEventListener("input", function() {

        choices.customFood = customFoodInput.value.trim();

        updateFinishButton();
    });
}


function showCustomFood() {

    const box = document.getElementById("custom-food-box");

    if (box) {
        box.classList.add("visible");
    }
}


function hideCustomFood() {

    const box = document.getElementById("custom-food-box");

    if (box) {
        box.classList.remove("visible");
    }

    const input = document.getElementById("custom-food-input");

    if (input) {
        input.value = "";
    }

    choices.customFood = "";
}


function updateFinishButton() {

    const button = document.getElementById("finish-button");

    const hasFood = choices.food.length > 0;

    const customSelected =
        choices.food.indexOf("Твой выбор") !== -1;

    const customHasText =
        choices.customFood.length > 0;


    if (customSelected && !customHasText) {
        button.disabled = true;
        return;
    }

    button.disabled = !hasFood;
}


// Формируем текст еды
function getFoodText() {

    const foodList = choices.food.slice();

    if (choices.customFood) {

        const index = foodList.indexOf("Твой выбор");

        if (index !== -1) {
            foodList[index] =
                "Твой выбор: " + choices.customFood;
        }
    }

    return foodList.join(", ");
}


// Отправка результата в Telegram
async function finishDate() {

    if (
        !choices.date ||
        !choices.time ||
        choices.activities.length === 0 ||
        choices.food.length === 0
    ) {
        return;
    }


    const foodText = getFoodText();


    const result = {
        date: choices.date,
        time: choices.time,
        activity: choices.activities.join(", "),
        food: foodText
    };


    const finishButton =
        document.getElementById("finish-button");

    finishButton.disabled = true;
    finishButton.textContent = "Отправляем ❤️";


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(result)

        });


        if (!response.ok) {
            throw new Error("Server error");
        }


        showFinalScreen(result);


    } catch (error) {

        console.error(error);

        finishButton.disabled = false;
        finishButton.textContent = "Готово ❤️";


        alert(
            "Не получилось отправить выбор 😔\n\n" +
            "Проверь интернет-соединение и попробуй ещё раз."
        );
    }
}


// Финальный экран
function showFinalScreen(result) {

    const summary =
        document.getElementById("summary");


    summary.innerHTML =
        "<strong>📅 Дата:</strong> " +
        escapeHtml(result.date) +
        "<br>" +

        "<strong>⏰ Время:</strong> " +
        escapeHtml(result.time) +
        "<br>" +

        "<strong>🥰 Занятия:</strong> " +
        escapeHtml(result.activity) +
        "<br>" +

        "<strong>🍽️ Еда:</strong> " +
        escapeHtml(result.food);


    nextScreen("screen-done");
}


// Защита пользовательского текста
function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}
```

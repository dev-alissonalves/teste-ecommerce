const url = 'https://api.mercadolibre.com/sites/MLB/search?q=$computador';
const keyLocalStorage = 'cart-items';
let cartItems = [];
let totalPriceItems = 0.00;

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function cartItemClickListener(event) {
  event.srcElement.remove();
}

function removeCartItem(cartItem) {
  const indexOfElementToRemove = cartItems.findIndex(({ sku }) => sku === cartItem.sku);
  cartItems.splice(indexOfElementToRemove, 1);

  const res = document.querySelector('div.total-price');
  localStorage.setItem(keyLocalStorage, JSON.stringify(cartItems));
  totalPriceItems -= cartItem.salePrice;
  res.innerHTML = `R$: ${totalPriceItems.toFixed(2)}`;
}

function addCartItem(cartItem) {
  const res = document.querySelector('div.total-price');
  
  cartItems.push(cartItem);
  localStorage.setItem(keyLocalStorage, JSON.stringify(cartItems));
  totalPriceItems += cartItem.salePrice;
  res.innerHTML = `R$: ${totalPriceItems.toFixed(2)}`;
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  const cartItem = { sku, name, salePrice };

  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;

  li.addEventListener('click', cartItemClickListener);
  li.addEventListener('click', () => {
    removeCartItem(cartItem);
  });
  
  document.querySelector('.cart__items').appendChild(li);
  addCartItem(cartItem);
}

function fetchIdProductByID(id) {
  try {
    fetch(`https://api.mercadolibre.com/items/${id}`)
    .then((res) => res.json())
    .then((data) => {
      createCartItemElement({
        sku: data.id,
        name: data.title,
        salePrice: data.price,
      });
    });
  } catch (error) {
    console.log('API indisponível no momento.');
  }
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  const addButton = createCustomElement('button', 'item__add', 'Adicionar ao carrinho!');
  
  section.className = 'item';
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  document.querySelector('.items').appendChild(section);
  section.appendChild(addButton);

  addButton.addEventListener('click', () => {
    fetchIdProductByID(sku);
  });
}

const startLoading = () => {
  const loadingText = document.createElement('span');
  loadingText.className = 'loading';
  loadingText.innerText = 'Loading...';
  document.querySelector('.cart').appendChild(loadingText);
 };

const finishLoading = () => document.querySelector('.loading').remove();
function fetchProductItems() {
  startLoading();
  try {
    fetch(url)
    .then((res) => res.json())
    .then((data) => {
      finishLoading();
      data.results.forEach((product) => {
        createProductItemElement({
          sku: product.id,
          name: product.title,
          image: product.thumbnail,
        });
      });
    });
  } catch (error) {
    console.log('API indisponível no momento.');
  }
}

function removeAllElements() {
  const res = document.querySelector('.total-price');
  cartItems = [];

  localStorage.setItem(keyLocalStorage, JSON.stringify([]));
  [...document.getElementsByClassName('cart__item')].forEach((item) => 
  item.remove());
  res.innerHTML = `R$: ${totalPriceItems = 0}.00`;
}

function dataUpdateScreen() {
  const storedCartItems = JSON.parse(localStorage.getItem(keyLocalStorage));
  if (storedCartItems.length > 0) {
    storedCartItems.forEach((cartItem) => {
      createCartItemElement(cartItem);
    });
  }
}

window.onload = () => {
  fetchProductItems();

  if (localStorage.length > 0) {
    dataUpdateScreen();
  }
};

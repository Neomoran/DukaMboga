//variables

const cartBtn = document.querySelector(".cartBtn");
const closeCartBtn = document.querySelector(".closeCart");
const clearCartBtn = document.querySelector(".clearCart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cartOverlay");
const cartItems = document.querySelector(".cartItems");
const cartTotal = document.querySelector(".cartTotal");
const cartContent = document.querySelector(".cartContent");
const productsDOM = document.querySelector(".productsCenter");

//cart
let cart = [];

//buttons
let buttonsDOM = [];

//Getting the products
class Products {
  //getPrudcts fx
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//UI class/ Displaying products
class UI {
  //display product
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
        <!-- single product -->
        <article class="product">
          <div class="imgContainer">
            <img src=${product.image}
            alt="product"
            class="productImg" />
            <button class="bagBtn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div>
          <h3>${product.title}</h3>
          <h3>Kes. ${product.price}</h3>
        </article>
        <!--end of single product -->
        `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bagBtn")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "In the bag";
        button.disabled = true;
      }
      button.addEventListener("click", e => {
        e.target.innerText = "In the bag";
        e.target.disabled = true;
        //Get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        console.log(cartItem);
        //Add product to the cart
        cart = [...cart, cartItem];
        //Save cart in the Local storage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        //Display cart item
        this.addCartItem(cartItem);
        //Show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cartItem");
    div.innerHTML = `<img src=${item.image} alt="product" />
    <div>
      <h4>${item.title}</h4>
      <h5>Kes.${item.price}</h5>
      <span class="removeItem" data-id=${item.id}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="itemAmount">${item.amount}</p>
      <i class="fas fa-chevron-down"data-id=${item.id}></i>
    </div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    //Clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    //cart functionality
    cartContent.addEventListener("click", e => {
      if (e.target.classList.contains("removeItem")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-shopping-cart"></i>add to bag';
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

//Local storage
class Storage {
  //static method can be used without instantiating the class
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setup application
  ui.setupApp();
  //get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});

//3.38 setting up data from contentful
//Go to www.contentful.com
//Sign up with elianiraymond0@gmail.com
//Contentful is a content cms if.e BYOC; Bring your own content
//log in
//under space home; just like a db
//under content model; just like the structure for each and every product you gonna have. gonna have things like title, image, price etc
//under content; your existing project structures
//under the hamburger bars is the space, click on it to add new space, choose free one and create one with name as example
//Go to settings, general settings to delete a space.
//To consume data as an API, go to settings then API keys

//3.46 create our contentful

/*(function() {
  localStorage.clear();
})();*/

function deleteRecipeFromStorage(id) {
  localStorage.removeItem(id);   
}

function saveRecipeToStorage(name, ingredients, directions) {
  const ls = localStorage;
  if(ls) {
    // generate id to recipe based on current date
    const recipeId = 'TatuPutto_recipes_' + new Date().getTime();
    ls.setItem(recipeId, JSON.stringify({name, ingredients, directions}));
  } else {
    console.log('Your browser doesn\'t support local storage.');
  }
}


function editRecipeInStorage(id, name, ingredients, directions) {
  // delete old version of the recipe
  localStorage.removeItem(id);
  const ls = localStorage;
  if (ls) {
    const recipeId = 'TatuPutto_recipes_' + new Date().getTime();
    ls.setItem(recipeId, JSON.stringify({name, ingredients, directions}));
  } else {
    console.log('Your browser doesn\'t support local storage.');
  }
}

function getRecipesFromStorage() {
  const ls = localStorage;
  if (ls) {
    const recipesInStorage = Object.keys(ls);
    let recipes = [];
    // loop through the local storage keys
    for(let i = 0; i < recipesInStorage.length; i++) {
      const recipe = ls.getItem(recipesInStorage[i]);
      const parsedRecipe = JSON.parse(recipe);

      recipes.push({
        id: recipesInStorage[i],
        name: parsedRecipe.name,
        ingredients: parsedRecipe.ingredients,
        directions: parsedRecipe.directions
      });
    }
    return recipes;
  } else {
    console.log('Your browser doesn\'t support local storage.');
    return [];
  }
}


class Application extends React.Component {
  constructor() {
    super();
    this.getRecipes = this.getRecipes.bind(this);
    this.showRecipeDetails = this.showRecipeDetails.bind(this);
    this.deleteRecipe = this.deleteRecipe.bind(this);
    this.editRecipe = this.editRecipe.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.state = {
      recipes: [],
      activeRecipeId: null,
      activeRecipeOpen: false,
      modalOpen: false,
      editing: false,
      recipeBeingEdited: null
    };
  }
  
  componentDidMount() {
    this.getRecipes();
  }

  getRecipes() {
    this.setState({recipes: getRecipesFromStorage()});   
  }
  
  showRecipeDetails(id) {
    const activeRecipeId = this.state.activeRecipeId;
    const isOpen = this.state.activeRecipeOpen;

    // close details if click happens to same recipe
    if(activeRecipeId == id && isOpen) {
      this.setState({
        activeRecipeId: null,
        activeRecipeOpen: false,
      });
    // close currently open details and open selected recipes details
    } else if(activeRecipeId != id) {
        this.setState({
          activeRecipeId: id,
          activeRecipeOpen: true,
        });
    }
  }
  
  deleteRecipe(id) {
    if(confirm('Are you sure you want to delete this recipe?')) {
      deleteRecipeFromStorage(id);
      this.setState({
        recipes: this.state.recipes.filter((recipe) => recipe.id != id)
      });
    }
  }
  
  // open modal and set up state for editing
  editRecipe(id) {
    this.setState({
      modalOpen: true,
      editing: true,
      recipeBeingEdited: this.state.recipes.filter(
          (recipe) => recipe.id == id)[0]
    });
  }
  
  openModal() {
    this.setState({modalOpen: true});   
  }
  
  closeModal() {
    this.setState({
      modalOpen: false,
      editing: false,
      recipeBeingEdited: null
    });  
  }
  
  render() {
    return (
      <div className='container-fluid'>
        {this.state.modalOpen &&
          <CreateOrEditRecipe
            isOpen={this.state.modalOpen}
            close={this.closeModal}
            getRecipes={this.getRecipes}
            editing={this.state.editing}
            recipe={this.state.recipeBeingEdited}
          />
        }
        <div className='content-wrapper col-lg-8 col-md-10 col-sm-12 col-xs-12'>
          <RecipeList 
            recipes={this.state.recipes}
            activeRecipeId={this.state.activeRecipeId}
            activeRecipeOpen={this.state.activeRecipeOpen}
            showRecipeDetails={this.showRecipeDetails}
            deleteRecipe={this.deleteRecipe}
            editRecipe={this.editRecipe}
            editing={this.state.editing}
          />
          <button className='new-recipe btn btn-info' onClick={this.openModal}>
            New Recipe
          </button>
        </div>
      </div>
    );
  }
}


function RecipeList(props) {
  const recipes = props.recipes.map((recipe) => {
    return (
      <Recipe
        id={recipe.id}
        name={recipe.name}
        ingredients={recipe.ingredients}
        directions={recipe.directions}
        activeRecipeId={props.activeRecipeId}
        activeRecipeOpen={props.activeRecipeOpen}
        showRecipeDetails={props.showRecipeDetails}
        deleteRecipe={props.deleteRecipe}
        editRecipe={props.editRecipe}
      />
    );
  });
  
  return (
    <div className='recipes'>
        {recipes.length > 0 ? 
            <ul className='recipe-list'>
              {recipes} 
            </ul>
            :
            <p className='no-recipes'>You don't have any recipes yet.</p>
        }
    </div>
  );
}

function Recipe(props) {
  const isOpen = props.id == props.activeRecipeId ? 'opened' : 'closed';
  
  return (
    <li key={props.id} className='recipe'>
      <div className='recipe-head'
          onClick={() => props.showRecipeDetails(props.id)}>
        <h2 className='recipe-name'>{props.name}</h2>
        <i className={'fa fa-chevron-left is-open-indicator ' + isOpen} />
      </div>
      {props.id == props.activeRecipeId &&
        <div className='recipe-details'>
          <div className='recipe-actions'>
            <button className='delete-recipe btn btn-danger'
                onClick={() => props.deleteRecipe(props.id)}>
              <i className='fa fa-trash-o' /> Delete 
            </button>
            <button className='edit-recipe btn btn-success'
                onClick={() => props.editRecipe(props.id)}>
              <i className='fa fa-edit' /> Edit
            </button>
          </div>
          <IngredientsTable key={props.directions} ingredients={props.ingredients} />
          <div className='recipe-directions'> 
            <h3>Directions</h3>
            <p>{props.directions}</p>
          </div>
        </div>
      }
    </li>
  );
}

function IngredientsTable(props) {
  const tableRows = props.ingredients.map((ingredient) => {
    return (
      <tr key={ingredient.ingredient}> 
        <td>
          {ingredient.amount}
        </td>
        <td>
          {ingredient.ingredient}
        </td>   
      </tr>
    );
  });
  
  return (
    <div className='recipe-ingredients'>
      <h3>Ingredients</h3>
      <table>
        {tableRows}
      </table>
    </div>
  );
}

class CreateOrEditRecipe extends React.Component {
  constructor() {
    super();
    this.addIngredientField = this.addIngredientField.bind(this);
    this.getFormData = this.getFormData.bind(this);
    this.createOrEditRecipe = this.createOrEditRecipe.bind(this);
  }
  
  componentWillMount() {
    const recipe = this.props.recipe;
    
    // if editing, set state to reflect recipe info
    if(this.props.editing) {
      this.setState({
        id: recipe.id,
        name: recipe.name,
        directions: recipe.directions,
        // create ids for ingredients to be used as keys for ingredient fields
        ingredients: recipe.ingredients.map((ingredient, i) => {
          return {...ingredient, id: i}
        }),
        ingredientFieldsCreated: recipe.ingredients.length,
      });
    // if not editing, set empty values and start form with 2 empty ingredient fields
    } else {
      this.setState({
        name: '',
        directions: '',
        ingredients: [
          {id: 0, ingredient: '', amount: ''},
          {id: 1, ingredient: '', amount: ''}
        ],
        ingredientFieldsCreated: 2,
      });  
    }
  }
  
  componentDidMount() {
    // set textarea height to match the content (directions)
    const element = document.querySelector('.create-recipe-directions');
    element.style.height = '' + (element.scrollHeight + 10) + 'px';
    
    // set overlay height to completely wrap modal window
    const documentHeight = document.body.scrollHeight;
    const overlay = document.getElementsByClassName('overlay')[0];
    overlay.style.height = (documentHeight + 20) + 'px';
  } 

  addIngredientField() {
    this.setState({
      ingredients: this.state.ingredients.concat({
        id: this.state.ingredientFieldsCreated,
        ingredient: '',
        amount: ''
      }),
      ingredientFieldsCreated: this.state.ingredientFieldsCreated + 1
    });
  }
  
  removeField(index) {
    this.setState({
      ingredients: this.state.ingredients.filter((_, i) => i !== index)
    });
  }
  
  createOrEditRecipe(name, directions, ingredients) {
    if(this.props.editing) {
      editRecipeInStorage(this.state.id, name, ingredients, directions);  
    } else {
      saveRecipeToStorage(name, ingredients, directions);  
    }
    
    this.props.getRecipes();
    this.props.close();
  }

  getFormData() {
    const name = document.getElementsByClassName('create-recipe-name')[0].value;
    const directions = document.getElementsByClassName('create-recipe-directions')[0].value;
    const ingredientFields = document.getElementsByClassName('create-recipe-ingredient-field');
    let ingredients = [];
    
    // submit form if any of the fields are empty == trigger required check
    if(!name || !directions || !ingredientFields) {
       return true;
    }      
    
    for(let i = 0; i < ingredientFields.length; i++) {
      const ingredient = document.getElementsByClassName('create-recipe-ingredient')[i].value;
      const amount = document.getElementsByClassName('create-recipe-amount')[i].value;
    
      if(ingredient && amount) {
        ingredients.push({ingredient, amount});
      } else {
        return true;
      }
    }
    
    // if everything checks out, push recipe to localstorage and cancel form submission
    this.createOrEditRecipe(name, directions, ingredients);
    return false;
  }
  
  
  createIngredientFields() {
    let ingredientFields = [];
    for(let i = 0; i < this.state.ingredients.length; i++) {
      const ingredient = this.state.ingredients[i];
      ingredientFields.push(
         <div key={ingredient.id.toString()}
            className='create-recipe-ingredient-field'>
          <span>
            <input           
              type='text'
              className='create-recipe-ingredient'
              defaultValue={ingredient.ingredient}
              placeholder={(i + 1) + '. ingredient'}
              required={true}
            />
          </span>
          <span>
            <input 
              type='text'
              className='create-recipe-amount'
              defaultValue={ingredient.amount}
              placeholder='Amount'
              required={true}
            />
          </span>
          <span>
              <i className='fa fa-remove' 
                  onClick={() => this.removeField(i)} />    
          </span>
        </div>
      );
    }
    return ingredientFields;
  }
  
  render() {
    return (
      <div className='overlay'>
        <div className='create-recipe col-lg-6 col-md-8 col-sm-10 col-xs-10'>
          <div className='create-recipe-head'>
            <h3>{this.props.editing ?
                'Edit Recipe' : 'Create a New Recipe'}</h3>
            <i className='close-modal fa fa-remove' 
                onClick={this.props.close} />
          </div>
          
          <div className='create-recipe-content'>
            <form>
              <input 
                type='text'
                className='create-recipe-name'
                defaultValue={this.state.name}
                placeholder='Recipe'
                required={true}
              />
              <textarea 
                className='create-recipe-directions'
                rows='4'
                defaultValue={this.state.directions}    
                placeholder='Directions'
                required={true}
              />   
              {this.createIngredientFields()}
              <input
                type='submit'
                className='create btn btn-success'
                value={this.props.editing ? 'Save Changes' : 'Create'}
                onClick={this.getFormData}
              />
            </form>
            <button 
              className='add-ingredient btn btn-info'
              onClick={this.addIngredientField}
            >
              Add Ingredient
            </button>
          </div>   
        </div>  
      </div>
    );
  }
}


ReactDOM.render(<Application />, document.getElementById('app'));
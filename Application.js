function clearStorage() {
  return localStorage.clear();
}

function deleteRecipeFromStorage(name) {
    if(confirm('Are you sure you want to delete this recipe?')) {
      localStorage.removeItem(name);   
    }
  }

// save recipe to local storage
function saveRecipeToStorage(name, ingredients, directions) {
  const ls = localStorage;
  if (ls) {
    ls.setItem('_TatuPutto_recipes_' + name, JSON.stringify({ingredients, directions}));
  } else {
    console.log('Your browser doesn\'t support local storage.');
  }
}

function editRecipeInStorage(oldName, newName,
    ingredients, directions) {
  // delete old version of the recipe
  localStorage.removeItem(oldName);
  const ls = localStorage;
  if (ls) {
    ls.setItem('_TatuPutto_recipes_' + newName, JSON.stringify({ingredients, directions}));
  } else {
    console.log('Your browser doesn\'t support local storage.');
  }
}

// get recipes from local storage
function getRecipesFromStorage() {
  const ls = localStorage;
  if (ls) {
    const recipesInStorage = Object.keys(ls);
    let recipes = [];
    // loop through the local storage keys
    for(let i = 0; i < recipesInStorage.length; i++) {
      const name = recipesInStorage[i]
          .replace(/_TatuPutto_recipes_/g, '');
      const recipe = ls.getItem(recipesInStorage[i]);
      const parsedRecipe = JSON.parse(recipe);

      recipes.push({
        name,
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
      activeRecipeName: null,
      activeRecipeOpen: false,
      modalOpen: false,
      editing: false,
      recipeBeingEdited: null
    };
  }
  
  // get recipes from local storage when component is mounted
  componentDidMount() {
    this.getRecipes();
  }

  // get recipes from local storage
  getRecipes() {
    this.setState({recipes: getRecipesFromStorage()});   
  }
  
  // open recipe details
  showRecipeDetails(name) {
    const activeRecipe = this.state.activeRecipeName;
    const isOpen = this.state.activeRecipeOpen;

    // close details if click happens to same recipe
    if(activeRecipe == name && isOpen) {
      return this.setState({
        activeRecipeName: null,
        activeRecipeOpen: false,
      });
    // close currently open details and
    // open newly selected recipes details
    } else if(activeRecipe != name) {
        this.setState({
          activeRecipeName: name,
          activeRecipeOpen: true,
        });
    }
  }
  
  deleteRecipe(name) {
    // delete recipe from local storage
    deleteRecipeFromStorage(name);
    // delete recipe from state
    this.setState({
      recipes: this.state.recipes.filter(
          (recipe) => recipe.name != name)
    });
  }
  
  // open modal and set up state for editing
  editRecipe(name) {
    this.setState({
      modalOpen: true,
      editing: true,
      recipeBeingEdited: this.state.recipes.filter(
          (recipe) => recipe.name == name)[0]
    });
  }
  
  // open modal window
  openModal() {
    this.setState({modalOpen: true});   
  }
  
  // close modal window and cancel edititing
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
        <div className='content-wrapper col-md-8 offset-2'>
          <RecipeList 
            recipes={this.state.recipes}
            activeRecipeName={this.state.activeRecipeName}
            showRecipeDetails={this.showRecipeDetails}
            deleteRecipe={this.deleteRecipe}
            editRecipe={this.editRecipe}
            editing={this.state.editing}
          />
          <button className='btn btn-info' onClick={this.openModal}>
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
        name={recipe.name}
        ingredients={recipe.ingredients}
        directions={recipe.directions}
        activeRecipeName={props.activeRecipeName}
        showRecipeDetails={props.showRecipeDetails}
        deleteRecipe={props.deleteRecipe}
        editRecipe={props.editRecipe}
        editing={props.editing}
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
            <p>You don't have any recipes yet.</p>
        }
    </div>
  );
}

function Recipe(props) {
  console.log(props)
  return (
    <li className='recipe'>
      <div className='recipe-head'
          onClick={() => props.showRecipeDetails(props.name)}>
        <h2 className='recipe-name'>{props.name}</h2>
      </div>
      {props.name == props.activeRecipeName &&
        <div className='recipe-details'>
          <div className='recipe-actions'>
            <button className='delete-recipe btn btn-danger'
                onClick={() => props.deleteRecipe(props.name)}>
              <i className='fa fa-trash-o' /> Delete 
            </button>
            <button className='edit-recipe btn btn-success'
                onClick={() => props.editRecipe(props.name)}>
              <i className='fa fa-edit' /> Edit
            </button>
          </div>
          <IngredientsTable ingredients={props.ingredients} />
          <div className='recipe-directions'>
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
      <tr> 
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
    <div className='ingredients-table-wrapper'>
      <table>
        {tableRows}
      </table>
    </div>
  );
}


class CreateOrEditRecipe extends React.Component {
  constructor() {
    super();
    this.addField = this.addField.bind(this);
    this.createOrEditRecipe = this.createOrEditRecipe.bind(this);
  }
 
  componentWillMount() {
    const recipe = this.props.recipe;
    
    if(this.props.editing) {
      this.setState({
        name: recipe.name,
        directions: recipe.directions,
        ingredients: recipe.ingredients.map((ingredient, i) => {
          return {...ingredient, id: i}
        }),
        ingredientFieldsCreated: recipe.ingredients.length,
      });  
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
  
  // 
  componentDidMount() {
    const element = document.querySelector('.directions');
    element.style.height = '' + (element.scrollHeight + 10) + 'px'; 
  } 

  // add ingredient field
  addField() {
    this.setState({
      ingredients: this.state.ingredients.concat({
        id: this.state.ingredientFieldsCreated,
        ingredient: '',
        amount: ''
      }),
      ingredientFieldsCreated: this.state.ingredientFieldsCreated + 1
    });
  }
  
  // remove ingredient field
  removeField(index) {
    this.setState({
      ingredients: this.state.ingredients.filter(
          (_, i) => i !== index)
    });
  }
  
  createOrEditRecipe() {
    const data = this.getFormData();
    
    if(this.props.editing) {
      const oldName = this.state.name;
      editRecipeInStorage(oldName, data.name, data.ingredients, data.directions);  
    } else {
      saveRecipeToStorage(data.name, data.ingredients, data.directions);  
    }
    
    this.props.getRecipes();
    this.props.close();
  }

  getFormData() {
    const name = document.getElementsByClassName('name')[0].value;
    const directions = document.getElementsByClassName('directions')[0].value;
    const ingredientFields = document.getElementsByClassName('create-recipe-ingredient');
    let ingredients = [];
    
    for(let i = 0; i < ingredientFields.length; i++) {
      const ingredient = document.getElementsByClassName('ingredient')[i].value;
      const amount = document.getElementsByClassName('amount')[i].value;
    
      if(ingredient && amount) {
        ingredients.push({ingredient, amount});
      }     
    }
    return {name, directions, ingredients};
  }
  
  
  createIngredientFields() {
    console.log(this.state.ingredients)
    let ingredientFields = [];
    for(let i = 0; i < this.state.ingredients.length; i++) {
      const ingredient = this.state.ingredients[i];
      ingredientFields.push(
         <div key={ingredient.id.toString()} className='create-recipe-ingredient'>
          <span>
            <input           
              type='text'
              className='ingredient'
              defaultValue={ingredient.ingredient}
              placeholder={(i + 1) + '. ingredient'}
            />
          </span>
          <span>
            <input type='text' className='amount'
              defaultValue={ingredient.amount}
                placeholder='Amount' />
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
        <div className='create-recipe'>
          <div className='create-recipe-head'>
            <h5>{this.props.editing ?
                'Edit Recipe' : 'Create a New Recipe'}</h5>
            <i className='close fa fa-remove' 
                onClick={this.props.close} />
          </div>
          
          <div className='create-recipe-content'>
            <input 
              type='text'
              className='name'
              defaultValue={this.state.name}
              placeholder='Recipe'
            />
            <textarea 
              className='directions'
              rows='4'
              defaultValue={this.state.directions}    
              placeholder='Directions'
            />   
            {this.createIngredientFields()} 
          </div>
          
          <div className='create-recipe-footer'>
            <button className='btn btn-info'
                onClick={this.addField}>Add Ingredient</button>
            <button className='create btn btn-success'
                onClick={this.createOrEditRecipe}>
              {this.props.editing ? 'Save Changes' : 'Create'}
            </button>         
          </div>
        </div>  
      </div>
    );
  }
}


ReactDOM.render(<Application />, document.getElementById('app'));
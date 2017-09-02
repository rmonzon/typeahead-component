import Autocomplete from './Autocomplete';
import usStates from './us-states';
import './main.css';


// US States
const staticData = usStates.map(state => ({
  text: state.name,
  value: state.abbreviation
}));

new Autocomplete(document.getElementById('state'), {
  data: staticData,
  onSelect: (stateCode) => {
    console.log('selected state:', stateCode);
  },
});


// Github Users
new Autocomplete(document.getElementById('gh-user'), {
  url: 'https://api.github.com/search/users',
  onSelect: (ghUserId) => {
    console.log('selected github user id:', ghUserId);
  },
});

// Github Users
new Autocomplete(document.getElementById('gh2-user'), {
  url: 'https://api.github.com/search/users',
  onSelect: (ghUserId) => {
    console.log('selected github 2 user id:', ghUserId);
  }
});

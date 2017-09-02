export default class Autocomplete {
  constructor(rootEl, options = {}) {
    options = Object.assign({ numOfResults: 10, data: [] }, options);
    Object.assign(this, { rootEl, options });
    this.timer = null;
    this.selectionIndex = -1;

    this.init();
  }

  onQueryChange(query, self) {
    // Get data for the dropdown
    let {url, data, numOfResults} = self.options;
    if (url && query) {
      self.getDataAsync(query).then(response => {
        data = self.parseUsersData(response.items);
        self.updateDropdown(data);
      });
    }
    else {
      let results = self.getResults(query, data);
      results = results.slice(0, numOfResults);

      self.updateDropdown(results);
    }
  }

  /**
   * Given an array and a query, return a filtered array based on the query.
   */
  getResults(query, data) {
    if (!query) return [];

    // Filter for matching strings
    let results = data.filter((item) => {
      return item.text.toLowerCase().includes(query.toLowerCase());
    });

    return results;
  }

  updateDropdown(results) {
    this.listEl.innerHTML = '';
    this.listEl.appendChild(this.createResultsEl(results));
  }

  createResultsEl(results) {
    const fragment = document.createDocumentFragment();
    results.forEach((result) => {
      const el = document.createElement('li');
      Object.assign(el, {
        className: 'result',
        textContent: result.text,
        id: result.value
      });

      // Pass the value to the onSelect callback
      el.addEventListener('click', e => {
        this.passInputValueCallback(result);

      });

      // reset all selected items on mouse hover
      el.addEventListener('mouseover', e => {
        this.selectionIndex = -1;
        this.removeHoverColorOfResults();
      });

      fragment.appendChild(el);
    });
    return fragment;
  }

  createQueryInputEl() {
    const inputEl = document.createElement('input');
    Object.assign(inputEl, {
      type: 'search',
      name: 'query',
      autocomplete: 'off',
    });

    if (this.options.url) {
      // clear the results list when the 'x' is clicked
      inputEl.addEventListener('search', e => {
        this.updateDropdown([]);
      });

      inputEl.addEventListener('keyup', e => {
        clearTimeout(this.timer);
        if (e.target.value && e.keyCode !== 40 && e.keyCode !== 38) {
          // small delay to avoid sending many request when the user types in too fast
          this.timer = setTimeout(this.onQueryChange, 300, e.target.value, this);
        }
      });
    }
    else {
      inputEl.addEventListener('input', event => this.onQueryChange(event.target.value, this));
    }

    // make sure arrow keys navigation through results is done regardless the type of component
    inputEl.addEventListener('keydown', e => {
      clearTimeout(this.timer);

      // querying the DOM only if I'm moving up/down the results dropdown
      if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 13) {
        const results = [...document.querySelector(`#${this.rootEl.id} .results`).children];
        switch (e.keyCode) {
          // enter key
          case 13: {
            const result = results[this.selectionIndex];
            if (result) {
              this.passInputValueCallback({value: results[this.selectionIndex].id});
            }
            break;
          }
          // arrow up
          case 38: {
            if (this.selectionIndex > 0) {
              this.removeHoverColorOfResults();
              this.selectionIndex--;
              results[this.selectionIndex].classList.add('item__selected');
            }
            break;
          }
          // arrow down
          case 40: {
            if (this.selectionIndex < results.length - 1) {
              this.removeHoverColorOfResults();
              this.selectionIndex++;
              results[this.selectionIndex].classList.add('item__selected');
            }
            break;
          }
        }
      }
    });
    return inputEl;
  }

  removeHoverColorOfResults() {
    const results = [...document.querySelector(`#${this.rootEl.id} .results`).children];
    results.map(elem => {
      elem.classList.remove('item__selected');
      return elem;
    });
  }

  async getDataAsync(query) {
    const {numOfResults, url} = this.options;
    const response = await fetch(`${url}?q=${query}&per_page=${numOfResults}`);
    return await response.json();
  }

  parseUsersData(users) {
    if (!users) {
      return [];
    }
    return users.map(user => {
      user = { text: user.login, value: user.id };
      return user;
    });
  }

  passInputValueCallback(result) {
    const { onSelect } = this.options;
    if (typeof onSelect === 'function') onSelect(result.value);
  }

  init() {
    // Build query input
    this.inputEl = this.createQueryInputEl();
    this.rootEl.appendChild(this.inputEl);

    // Build results dropdown
    this.listEl = document.createElement('ul');
    Object.assign(this.listEl, { className: 'results' });
    this.rootEl.appendChild(this.listEl);
  }
}

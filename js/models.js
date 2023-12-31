"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";
// const STORIES_URL = "/stories";
/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */
  getHostName() {
    console.debug('this.getHostName');
    const url = new URL(this.url);
    return url.hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  async addStory(user, newStory) {

    const { author, title, url } = newStory;

    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      //newStory = title, author and url
      data: {
        "token": user.loginToken, "story": { author, title, url }
      },
    });

    const submittedStory = new Story(response.data.story);

    this.stories.unshift(submittedStory);
    return submittedStory;
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      const { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /** favoriteStory: Post request to add favorited story, updates user instance,
   * calls UI add
   * accepts story instance
   */

  async addFavorite(story){
    // post request to API
    // update user instance locally
    // call add to favorite page UI
    const response = await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: "POST",
      data: { token: this.loginToken },
    });
    console.log("api request response=", response);
    this.favorites = response.data.user.favorites.map(s => new Story(s));

    //addFavoritedStoryToUi(user);
  }

  /** unFavoriteStory: Delete request to remmove story from favorites array,
   * updates user instance, calls UI remove
   * accepts story instance
   */

  async removeFavorite(story){
    // delete request to API
    // update user instance locally
    // call remove from favorite page UI
    const response = await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: "DELETE",
      data: { token: this.loginToken },
    });

    this.favorites = response.data.user.favorites.map(s => new Story(s));

    //removeFavoritedStoryFromUi(user);
  }

  /** checkFavoriteStatus: Checks current user's favorites list to see if clicked
   * story is located there - calls unFavoriteStory if so, favoriteStory if not
   * accepts story instance from click event
   */

  checkFavoriteStatus(story){
    //check currentUser for info --> currentUser.favorites
    const favoritesList = currentUser.favorites;
    const storyId = story.storyId;
    for(let item of favoritesList){
      if(storyId === favoritesList.storyId) {
        console.log(item);
          this.unFavoriteStory(item);
      }
    }
    this.favoriteStory(item);
  }
}

/* click event on the star
  => either send that to favoriting function or un-favoritng depending
  on the status of the toggle ==> if post-id present in the favorites array of currUser
  => if favoriting ==> send api post request to add that story instance to
  the favorites array in currentUser
  => if unfavoriting ==> send api delete request to remove that story from array

  update the user instance on local memory so that the favorites array is accessible
*/

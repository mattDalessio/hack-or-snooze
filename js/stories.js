"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/** Gets data from submit story form, calls addStory, calls putStoriesOnPage */

async function getAndShowNewStory(evt) {
  //gets data from submit form
  //call .addStory
  //puts new story on DOM (in .stories-container)
  //{title: "Test", author: "Me", url: "http://meow.com"}

  evt.preventDefault();

  const storyAuthor = $("#submit-author").val();
  const storyTitle = $("#submit-story-title").val();
  const storyUrl = $("#submit-url").val();

  const newStory = { title: storyTitle, author: storyAuthor, url: storyUrl };
  const storyInstance = await storyList.addStory(currentUser, newStory);

  //make html for that story in particular and add to top of dom using markUp
  //function and then just prepend to the list
  //console.log({storyList});
  const prepareSubmittedStory = await generateStoryMarkup(storyInstance);
  //console.log({prepareSubmittedStory});
  prepareSubmittedStory.prependTo($allStoriesList);
  //putStoriesOnPage();
}

$submitStoryForm.on("submit", getAndShowNewStory);



/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <span>
        <i class="Star bi bi-star"></i>
      </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


$(".stories-container").on("click", ".Star", function (evt) {
  if ($(evt.target).hasClass("bi bi-star")) {
    $(evt.target).removeClass("bi bi-star");
    $(evt.target).toggleClass("bi bi-star-fill");
  } else {
    $(evt.target).removeClass("bi bi-star-fill");
    $(evt.target).toggleClass("bi bi-star");
  }
  const id = $(evt.target).closest("li").attr("id");

  const matchedStory = storyList.stories.filter((obj) => obj.storyId === id);
  //TODO:we we place this so we can access this function??
  checkFavoriteStatus(matchedStory);
});




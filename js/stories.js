"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/** Gets data from submit story form, calls addStory, puts new story on DOM */

async function getAndShowNewStory (){
  //gets data from submit form
  //call .addStory
  //puts new story on DOM (in .stories-container)
  //{title: "Test", author: "Me", url: "http://meow.com"}
  console.log("getAndShowNewStory runs");

  const storyAuthor = $("#submit-author").val();
  const storyTitle = $("#submit-story-title").val();
  const storyUrl = $("#submit-url").val();

  const newStory = {title: storyTitle, author: storyAuthor, url: storyUrl};
  console.log("newStory=", newStory);
  const submittedStory = await storyList.addStory(currentUser, newStory);
  console.log("submittedStory=", submittedStory);
  putStoriesOnPage();

}

$submitStoryForm.on("submit", async function handleSubmitForm(evt){
  evt.preventDefault();
  await getAndShowNewStory();
  console.log("submit ran");
});



/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
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

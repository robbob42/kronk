// app/static/js/screensaver-content.js

const KRONK_QUOTES = [
    "This is my world. And this is my story. - Kuzco",
    "Boo-yah! - Kuzco",
    "I am the emperor. And as such, I'm a very busy man. - Kuzco",
    "So, you're the peasant who's building his summer home on my favorite hilltop. - Kuzco",
    "Uh-oh. - Pacha",
    "Don't tell me. We're about to go over a huge waterfall. - Kronk",
    "Yep. - Pacha",
    "Sharp rocks at the bottom? - Kronk",
    "Most likely. - Pacha",
    "Bring it on. - Kronk",
    "No touchy! - Kuzco",
    "Demon llama! - Old Man",
    "A llama?! He's supposed to be dead! - Yzma",
    "Yeah, weird. - Kronk",
    "To the secret lab! - Yzma",
    "Pull the lever, Kronk! - Yzma",
    "Wrong lever! - Yzma",
    "Why do we even have that lever? - Yzma",
    "This is Yzma, the emperor's advisor. Living proof that dinosaurs once roamed the Earth. - Kuzco",
    "So, is that a 'no' on the spinach puffs? - Kronk",
    "I never liked your spinach puffs! Never! - Yzma",
    "Ah, how shall I do it? Oh, I know. I'll turn him into a flea, a harmless little flea, and then I'll put that flea in a box... - Yzma",
    "Oh, right. The poison. The poison for Kuzco, the poison chosen especially to kill Kuzco, Kuzco's poison. That poison? - Kronk",
    "A Llama?! He's supposed to be DEAD! - Yzma",
    "You know, the funny thing about birthdays is, they're kind of an annual thing. - Kronk",
    "Well, he ain't gettin' any deader. - Kronk",
    "Let's get back to business. - Yzma",
    "My name is Pacha. - Pacha",
    "We're on our honeymoon. - Pacha",
    "Bless you for coming out in public. - Waitress",
    "You know, I'm pretty sure I'm the only one who knows that you're a... - Kronk",
    "The peasant at the diner! He didn't pay his check. - Kronk",
    "Squeak squeaker, squeak, squeakin'. - Squirrel",
    "I was a junior chipmunk and I had to be observant. - Kronk",
    "My acorn is missing. - Squirrel",
    "You owe me a new acorn. - Squirrel",
    "It's not a purse, it's a satchel. Indiana Jones wears one. - Pacha",
    "For the last time, it was not a vacation. It was an expedition. - Pacha",
    "You're a good guy, Pacha. But I'm the emperor. - Kuzco",
    "What, you didn't see that coming? - Kuzco",
    "Okay, a quick cup of coffee, then we're on our way. - Pacha",
    "Don't listen to that guy. He's trying to lead you down the path of righteousness. I'm gonna lead you down the path that rocks. - Kuzco's Shoulder Angel",
    "For me? You shouldn't have! Oh, wait, you didn't. - Kuzco",
    "Ha! You should have seen your face! - Kuzco",
    "This is not a good place for a llama. - Pacha",
    "Yay. I'm a llama again! ...Wait. - Kuzco",
    "So, you're saying this is a 'we' thing. - Kronk",
    "I'm the world's most-wanted emperor. - Kuzco",
    "Boom, baby! - Kuzco",
    "And let's not forget Yzma's right-hand man. Every decade or so she gets a new one. This year's model is called Kronk. - Kuzco",
    "What are the odds that that llama is the emperor? - Kronk",
    "It's called a 'cruel irony,' like my dependence on you. - Yzma",
    "I can't believe this is happening! - Kuzco",
    "This is the last time I help you animate. - Kronk",
    "Well, that's a deal-breaker. - Kuzco",
    "Uh-oh. The rope. - Kronk",
    "Yzma, put your hands in the air! - Kronk",
    "That's it. She's going down. - Kronk",
    "Hit the road, Bucky! - Kronk",
    "Well, I'm stumped. - Kronk"
];

const ANGEL_WHISPERS = [
    "A quick 5-minute tidy-up would feel great right now.",
    "Tell someone in your family you appreciate them.",
    "Maybe drink a glass of water.",
    "Did you remember to stretch today?",
    "A single page of a book is better than none.",
    "Go on, put that dish in the dishwasher. You'll thank yourself later.",
    "Think of one thing you're grateful for.",
    "Maybe it's a good time to double-check your homework.",
    "A fresh piece of fruit sounds pretty good, doesn't it?",
    "Hold the door for the next person.",
    "A kind word costs nothing.",
    "Why not learn a new word today?",
    "Taking a few deep breaths can make a big difference.",
    "Ask someone how their day was, and really listen.",
    "Flossing is your friend.",
    "Make your bed. It's a small win to start the day.",
    "That thing you're putting off? You could probably do it in under 10 minutes.",
    "Choose kindness, even when it's hard.",
    "A little bit of progress each day adds up to big results.",
    "Remember to compliment someone today.",
    "Maybe take the stairs instead of the elevator.",
    "Write down one goal for tomorrow.",
    "It's the perfect time to put on some happy music.",
    "Offer to help with dinner.",
    "Trust me, you'll feel better if you go to bed on time tonight."
];

const DEVIL_WHISPERS = [
    "You don't need to brush your teeth, just wet the toothbrush.",
    "Of course you should have that extra scoop of ice cream!",
    "Just one more episode... the next one starts in 5 seconds.",
    "Leave that dish in the sink. 'Future You' can deal with it.",
    "Is that cookie looking at you? I think it wants to be eaten.",
    "Homework is just a suggestion, right?",
    "Don't worry about folding the laundry. Just live out of the basket. It's more efficient.",
    "That alarm is for 'morning you.' 'Night you' deserves to stay up late.",
    "You don't need to write it down, you'll totally remember it later.",
    "Who needs water when there's soda in the fridge?",
    "It's not procrastinating, it's 'strategic postponement.'",
    "Go ahead, use the last of the milk. Someone else will buy more.",
    "'Five more minutes' of sleep is always a good idea.",
    "That squeak in the floor? It's the house's personality. No need to fix it.",
    "Just blame it on the dog.",
    "You worked hard today. Your reward is definitely at the bottom of that bag of chips.",
    "Why make your bed when you're just going to mess it up again tonight?",
    "Check your phone again. Something important probably happened in the last 30 seconds.",
    "Skip the vegetables. They're just taking up valuable stomach space.",
    "The floor is a perfectly acceptable place for that hoodie.",
    "It's not your turn to take out the trash. I'm almost positive."
];

const SPINACH_PUFF_RECIPE = [
    {
        image: 'static/images/kronk-spinach-puffs.jpg',
        text: 'Step 1: Preheat oven to 400°F (200°C).'
    },
    {
        image: 'static/images/kronk-spinach-puffs.jpg',
        text: 'Step 2: Thaw one 10-ounce package of frozen chopped spinach.'
    },
    {
        image: 'static/images/kronk-spinach-puffs.jpg',
        text: 'Step 3: Squeeze the spinach dry to remove as much water as possible.'
    },
    {
        image: 'static/images/kronk-spinach-puffs.jpg',
        text: 'Step 4: In a bowl, mix the spinach with 4oz of feta cheese and 2oz of cream cheese.'
    },
    {
        image: 'static/images/kronk-spinach-puffs.jpg',
        text: 'Step 5: Season with a pinch of salt, pepper, and nutmeg.'
    },
    {
        image: 'static/images/kronk-spinach-puffs.jpg',
        text: 'Step 6: Unroll one sheet of puff pastry and cut into 2-inch squares.'
    },
    {
        image: 'static/images/kronk-spinach-puffs.jpg',
        text: 'Step 7: Place a small amount of the spinach mixture in the center of each square.'
    },
    {
        image: 'static/images/kronk-spinach-puffs.jpg',
        text: 'Step 8: Fold the pastry over to form a triangle and press the edges to seal.'
    },
    {
        image: 'static/images/kronk-spinach-puffs.jpg',
        text: 'Step 9: Bake on a parchment-lined baking sheet for 15-20 minutes, until golden brown.'
    },
    {
        image: 'static/images/kronk-spinach-puffs.jpg',
        text: 'Step 10: Let cool for 5 minutes before serving. Squeaky squeak squeaken!'
    }
];
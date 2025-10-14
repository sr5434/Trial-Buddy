# Trial Buddy

## What it does

It generates a report explaining a clinical trial in terms that ordinary people can understand.

## How we built it

I uses the clinicaltrials.gov API to get information about a clinical trial. Then, the data on the clinical trials goes to GPT-5 for question generation. After the user answers the question, an agent powered by a model specialized for research tasks looks at numerous reputable sources from across the web to explain the clinical trial, including risks, eligibility requirements, potential benefits, and more, all in terms that an ordinary person can understand.

## Challenges we ran into

I tried to train a custom model but ultimately ran out of time due to the time-consuming nature of training.

## Accomplishments that we're proud of

I am proud that I was able to create a working agent. I am also proud that I built this as a solo dev.

## What we learned

I how to use polling to enable long running tasks without facing request timeouts.

## What's next for Trial Buddy

Instead of using a model that is designed for general research tasks, I plan to train my own model using reinforcement learning to maximize performance and efficiency for my task.

## Note for testers

The agent can take up to 15 minutes to perform research, so I recommend starting a run and then working on other things while you wait.

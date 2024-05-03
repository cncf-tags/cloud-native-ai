# Dashboard for visualizing conference summaries
## Github Page URL: https://loveyourself999.github.io/conference-dashboard/
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
***
## Overall Idea
### Build a dashboard application that visualize the youtube summaries to nevigate video content
1. Create an information dashboard using Next.js and Recharts.(https://ably.com/blog/informational-dashboard-with-nextjs-and-recharts#creating-the-charts-component)
2. Use D3 library for data visualization when developing the UI(https://d3js.org)
3. Fetch data from the summaries data collected by Github Action
4. Deploy dashboard app to GitHub Pages with GitHub Actions(https://pages.github.com)
***
## Building Steps
### To build a next.js app:
Make sure you installed npm by
~~~Bash
npm -v

// if not installed run
npm install -g npm@latest
~~~
Create a next.js file using command "npx create-next-app + your file name"
~~~Bash
npx create-next-app conference-dashboard
cd conference-dashboard
~~~
Run the app at [http://localhost:3000](http://localhost:3000)with your browser to see the result.
~~~bash
npm run dev
~~~

Editing the page by modifying `page.js`. The page auto-updates as you edit the file.

### To deploy app to Github Pages with Github Action
First create a repository for the app, push the code.

Enable GitHub Pages:
1. Go to your repository's Settings tab
2. Click "Pages" in the sidebar
3. Under "Build and Deployment", select "GitHub Actions" as the source:
<img width="1314" alt="Screen Shot 2024-04-26 at 4 57 09 PM" src="https://github.com/LoveYourself999/conference-dashboard/assets/54390035/c9999bf4-1c6c-45ee-b1e6-52d6e624b079">


You should see your site deployed to GitHub Pages in a few minutes. 

***
## To do
- Use D3 library for data visualization(example: https://github.com/nicolashery/example-d3-react?tab=readme-ov-file)
- Fetch data from the summaries data collected by Github Action
## Resources
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- https://www.youtube.com/watch?v=QyFcl_Fba-k&t=572s - Github Pages Intro
- https://www.youtube.com/watch?v=nded252qxcA - Deploy next.js to Github Pages
- https://ably.com/blog/informational-dashboard-with-nextjs-and-recharts - Building information dashboard

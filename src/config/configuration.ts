export default () => ({
    github: {
        url: process.env.GITHUB_URL,
        token: process.env.GITHUB_TOKEN
    },
    owner: {
        name: process.env.OWNER_NAME
    }
});
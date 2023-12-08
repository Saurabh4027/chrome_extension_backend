const axios = require("axios")
const cheerio = require("cheerio")
const OpenAI = require("openai")

async function getHeadline(articleUrl) {
    try {
      // Make a GET request to the article URL
      const response = await axios.get(articleUrl);
  
      // Load the HTML content into cheerio
      const $ = cheerio.load(response.data);
  
      // Find the h1 tag with classname 'HNMDR' and get the text inside the span tag
      const headline = $('h1.HNMDR span').text();
      const article = $('div._s30J.clearfix').text();
    //   console.log(article)

  
      // Output the extracted headline
      return {headline,article};
    } catch (error) {
      console.log('Error:', error.message);
    }
  }


const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

async function requestToOpenAI(prompt){
  try{
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
    });
  
    return chatCompletion.choices[0].message.content;
  }
  catch(err){
    console.log(err)
  }
}

async function getRhyme(articleUrl) {
    try {
      const articleData = await getHeadline(articleUrl);
      let prompt_to_convert_rhyme = `"${articleData.headline}" turn this sentence into a similar rhyming sentence that should also make sense, make sure to not give me anything else in the response except the converted rhyming sentence,Please make sure to make it rhyme somehow if the word is in hindi you can you hindi rhyming word also but the first priority is to make it rhyme`;
      let prompt_to_get_bias_report = `"${articleData.article}" analyse this article and give me a response on the basis of the bias of the article. i just need a short summary on the biasness of the article. make sure dont generate anything in the response except the short summary on the biasness of the article(if any)`
     const convertedHeadline = await requestToOpenAI(prompt_to_convert_rhyme)
     const biasSummary = await requestToOpenAI(prompt_to_get_bias_report)
     return {biasSummary,convertedHeadline}
    } catch (error) {
      return "Something went wrong";
    }
}

module.exports = getRhyme;
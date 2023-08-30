const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const {SlashCommandBuilder } = require("discord.js");
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API });
const axios = require("axios");

module.exports = {
    data:new SlashCommandBuilder()
    .setName('insert')
    .setDescription('本を登録します！')
    .addIntegerOption(option =>
        option.setName('isbn')
        .setDescription('ISBNを入力してください')
        .setRequired(true)),
        async execute(interaction) {
            let isbn = interaction.options.getInteger('isbn');
            const promise = fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
            promise.then((response) =>{
                return response.json();
            })
            .then((data) => {
                let result = data[0];
                (async () => {
                    const response = await notion.pages.create({
                        "parent": {
                            "type": "database_id",
                            "database_id": `${process.env.DBID}`
                        },
                        "properties": {
                            "title": {
                                "title": [
                                    { "text": { "content": `${result.summary.isbn}` } }
                                ]
                            },
                            "タイトル": {
                                "rich_text": [
                                    {"text": { "content": `${result.summary.title}`}}
                                ]
                            },
                            "著者": {
                                "rich_text": [
                                    {"text": { "content": `${result.summary.author}`}}
                                ]
                            },
                            "出版社": {
                                "rich_text": [
                                    {"text": { "content": `${result.summary.publisher}`}}
                                ]
                            }
                        }});
                    })();
                    interaction.reply({
                        embeds: [{
                            title: `追加完了`,
                            color: 0xF00035,
                            timestamp: new Date(),
                            footer: {
                                text: "高識先輩 / Google",
                            },
                            fields: [
                                {name: `書籍名`, value: result.summary.title, inline: true},
                                {name: `著者`, value: result.summary.author, inline: true},
                                {name: `出版社`, value: result.summary.publisher, inline: true},
                            ]
                        }]}); 
            })
        }  
}
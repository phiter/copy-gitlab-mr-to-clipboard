// ==UserScript==
// @name         Gitlab copy Merge Request information to clipboard (for Slack)
// @namespace    copy-gitlab-mr-to-clipboard
// @version      1.0
// @description  Copy a template from GitLab to paste on Slack
// @author       Phiter
// @match        https://*git*/*/-/merge_requests/*
// @homepage     https://github.com/phiter/copy-gitlab-mr-to-clipboard
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gitlab.com
// @require      https://unpkg.com/showdown/dist/showdown.min.js
// ==/UserScript==

(function() {
    'use strict';
    const getTitleElement = () => document.querySelector('[data-qa-selector="title_content"');

    const $title = getTitleElement();
    if (!$title) return;

    const $button = document.createElement('button');
    $button.innerHTML = '📋';
    $button.className = 'copy-slack-template btn btn btn-default btn-sm gl-button btn-default-tertiary btn-icon gl-display-none! gl-md-display-inline-block! js-source-branch-copy';

    $button.setAttribute('title', 'Copy template for Slack');

    $button.dataset.toggle = "tooltip";
    $button.dataset.placement = "right";
    $button.dataset.container = "body";

    $title.parentElement.appendChild($button);

    $button.addEventListener('click', () => {
        const converter = new showdown.Converter();
        const title = $title.innerHTML;
        const issueUrl = document.querySelector('[data-reference-type="external_issue"]')?.href;
        const projectName = document.querySelector('[data-qa-selector="sidebar_menu_link"]').getAttribute('href').substring(1);
        const projectHref = document.querySelector('[data-qa-selector="sidebar_menu_link"]').href;
        const pageUrl = document.querySelector('[data-action="show"]').href;
        const changesUrl = document.querySelector('[data-action="diffs"]').href;
        const commitsUrl = document.querySelector('[data-action="commits"]').href;
        const changes = document.querySelector('[data-action="diffs"] .badge').innerText;
        const commits = document.querySelector('[data-action="commits"] .badge').innerText;
        const titleMd = converter.makeMarkdown(title);
        const template = `> :partymerge:  ${titleMd}

> [**Files changed:**](${changesUrl}) ${changes} | [**Commits:**](${commitsUrl}) ${commits} | **Project:** [${projectName}](${projectHref})

> :gitlab:  [**Open on GitLab**](${pageUrl}) ${issueUrl ? `&nbsp;&nbsp;&nbsp;:jira:  [**Open on Jira**](${issueUrl})` : ''}`;

        const html = converter.makeHtml(template);

        const htmlType = "text/html";
        const textType = "text/plain";
        const htmlBlob = new Blob([html], { type: htmlType });
        const textBlob = new Blob([template], { type: textType });
        const data = [new ClipboardItem({ [htmlType]: htmlBlob, [textType]: textBlob })];

        navigator.clipboard.write(data);

        const tooltipId = $button.attributes['aria-describedby']?.value;
        if (tooltipId) {
            document.querySelector(`#${tooltipId} span`).innerHTML = 'Copied!';
        }
    });

    GM_addStyle(`
.issuable-meta {
  overflow: auto;
  align-items: center;
}
.copy-slack-template {
  margin-left: 16px;
}
   `);
})();
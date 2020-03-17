/**
 * @fileOverview
 * @name index.ts<integration/src>
 * @author Taketoshi Aono
 * @license
 */

import { Selector, ClientFunction } from "testcafe";

const scrollToBottom = ClientFunction(() => {
  document.querySelector(".ReactVirtualized__Table__Grid")!.scrollTo(0, 99999);
});
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

fixture("FileStorageService").page("http://localhost:8080");

test("Show initial", async t => {
  await sleep(1000);
  const firstListItem = Selector(".ReactVirtualized__Table__row:first-child");
  const secondListItem = Selector(".ReactVirtualized__Table__row:nth-child(2)");
  const thirdListItem = Selector(".ReactVirtualized__Table__row:nth-child(3)");

  await t
    .expect(
      firstListItem.find(".e2e__virtulized-table-colum__name").textContent
    )
    .eql("dummy_300");
  await t
    .expect(
      secondListItem.find(".e2e__virtulized-table-colum__name").textContent
    )
    .eql("dummy_299");
  await t
    .expect(
      thirdListItem.find(".e2e__virtulized-table-colum__name").textContent
    )
    .eql("dummy_298");

  await scrollToBottom();
  const lastListItem = Selector(".ReactVirtualized__Table__row:last-child");

  await t
    .expect(lastListItem.find(".e2e__virtulized-table-colum__name").textContent)
    .eql("dummy_201");
});

test("Pagenate", async t => {
  await sleep(1000);
  const secondItem = Selector(".e2e__pagenation_button:nth-child(2)");
  const thirdItem = Selector(".e2e__pagenation_button:nth-child(3)");

  await t.click(secondItem);
  await sleep(1000);

  {
    const firstListItem = Selector(".ReactVirtualized__Table__row:first-child");
    await t
      .expect(
        firstListItem.find(".e2e__virtulized-table-colum__name").textContent
      )
      .eql("dummy_200");

    await t.click(thirdItem);
    await sleep(1000);
  }
  {
    const firstListItem = Selector(".ReactVirtualized__Table__row:first-child");
    await t
      .expect(
        firstListItem.find(".e2e__virtulized-table-colum__name").textContent
      )
      .eql("dummy_100");
  }
});

test("Upload file to server", async t => {
  await sleep(1000);
  await t.setFilesToUpload(Selector(".e2e__upload"), "./index.ts");
  await sleep(500);
  const firstListItem = Selector(".ReactVirtualized__Table__row:first-child");

  await t
    .expect(
      firstListItem.find(".e2e__virtulized-table-colum__name").textContent
    )
    .eql("index.ts");
});

test("Delete file", async t => {
  await sleep(1000);
  const firstListItem = Selector(".ReactVirtualized__Table__row:first-child");
  await t.click(Selector(".e2e__show_delete_dialog"));
  await sleep(400);
  await t.click(Selector(".e2e__delete"));
  await sleep(500);

  await t
    .expect(
      firstListItem.find(".e2e__virtulized-table-colum__name").textContent
    )
    .eql("dummy_300");
});

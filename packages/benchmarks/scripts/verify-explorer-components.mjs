import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { BUILT_IN_THEMES } from '../../base-ui/src/theme/registry/catalog.ts';

// Start base-ui Storybook separately. Node's native TypeScript stripping reads the catalog.
const origin = process.argv[2] || 'http://localhost:6018';
const output = path.resolve(process.argv[3] || '/tmp/omniview-explorer-components');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const results = [];
const interactions = [];
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];

async function story(id, theme = 'dark', density = 'comfortable', textSize = '100', args = '') {
  const url = new URL('/iframe.html', origin);
  url.searchParams.set('id', id);
  url.searchParams.set('viewMode', 'story');
  url.searchParams.set('globals', `theme:${theme};density:${density};textSize:${textSize}`);
  if (args) url.searchParams.set('args', args);
  await page.goto(url.href);
  await page.waitForFunction(
    ({ theme, density, textSize }) => {
      const root = document.documentElement;
      return (
        root.dataset.ovTheme === theme &&
        root.dataset.ovDensity === density &&
        root.dataset.ovTextSize === textSize
      );
    },
    { theme, density, textSize },
  );
}
async function settle() {
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    for (const animation of document.getAnimations()) animation.finish();
  });
}
async function capture(name) {
  await settle();
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
}
async function popupGeometry() {
  return page.getByRole('listbox').evaluate((list) => {
    const popup = list.parentElement;
    const rect = popup.getBoundingClientRect();
    const input = document.querySelector('input[aria-expanded="true"]');
    const active = document.getElementById(input.getAttribute('aria-activedescendant'));
    return {
      width: rect.width,
      insideViewport:
        rect.left >= -1 &&
        rect.right <= innerWidth + 1 &&
        rect.top >= -1 &&
        rect.bottom <= innerHeight + 1,
      activeVisible:
        active.getBoundingClientRect().top >= rect.top - 1 &&
        active.getBoundingClientRect().bottom <= rect.bottom + 1,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
}

try {
  for (const { id: theme } of BUILT_IN_THEMES) {
    for (const density of ['comfortable', 'compact']) {
      await story('components-card-interactive--all-sizes', theme, density);
      const cards = page.locator('section[data-ov-interactive="true"]');
      await cards.first().waitFor();
      const geometry = await cards.evaluateAll((items) =>
        items.map((card) => ({
          size: card.dataset.ovSize,
          width: card.getBoundingClientRect().width,
          height: card.getBoundingClientRect().height,
          rail: getComputedStyle(card).getPropertyValue('--ov-size-card-selection-rail').trim(),
          railShadow: getComputedStyle(card, '::before').boxShadow,
          railRadius: getComputedStyle(card, '::before').borderRadius,
          cardRadius: getComputedStyle(card).borderRadius,
          overflow: card.scrollWidth > card.clientWidth + 1,
        })),
      );
      assert.deepEqual(
        geometry.map((card) => card.size),
        sizes,
      );
      assert(
        geometry.every(
          (card) =>
            card.width > 0 &&
            card.rail === '3px' &&
            card.railShadow.includes('inset') &&
            card.railRadius === card.cardRadius &&
            card.railRadius !== '0px' &&
            !card.overflow,
        ),
      );
      results.push({ component: 'Card', theme, density, geometry });
      await capture(`cards-${theme}-${density}`);
    }
    await story('components-keyedsearch--all-sizes', theme);
    await page.getByRole('combobox').first().waitFor();
    await capture(`search-${theme}-sizes`);
    for (const density of ['comfortable', 'compact']) {
      for (const size of sizes) {
        const input = page.getByRole('combobox', {
          name: `${density} ${size} search`,
          exact: true,
        });
        await input.fill('region:');
        await page.getByRole('listbox').waitFor();
        await settle();
        const geometry = await popupGeometry();
        assert(
          geometry.width > 100 &&
            geometry.insideViewport &&
            geometry.activeVisible &&
            !geometry.overflow,
          JSON.stringify({ theme, density, size, geometry }),
        );
        results.push({ component: 'KeyedSearch', theme, density, size, geometry });
        await input.press('Escape');
      }
    }
    await capture(`search-${theme}-edited-sizes`);
  }

  for (const theme of ['dark', 'light']) {
    for (const textSize of ['80', '90', '100', '110', '125']) {
      await story('components-keyedsearch--all-sizes', theme, 'comfortable', textSize);
      await page.getByRole('combobox').first().waitFor();
      const fitting = await page.getByRole('combobox').evaluateAll((inputs) =>
        inputs.every((input) => {
          const overlay = input.parentElement.parentElement.querySelector(
            '[data-ov-keyed-search-highlight]',
          );
          const line = parseFloat(getComputedStyle(input).lineHeight);
          return (
            line <= input.getBoundingClientRect().height + 1 &&
            line <= overlay.getBoundingClientRect().height + 1
          );
        }),
      );
      assert(fitting, `${theme} text size ${textSize} clips native text or syntax overlay`);
      await capture(`text-scale-${theme}-${textSize}`);
    }
  }

  await story('components-iconpicker--theme-size-matrix');
  for (const theme of BUILT_IN_THEMES) {
    for (const density of ['comfortable', 'compact']) {
      for (const size of sizes) {
        const label = `${theme.name} ${density} ${size} icon`;
        const trigger = page.getByRole('button', { name: `${label}: Folder`, exact: true });
        await trigger.click();
        const popup = page.getByRole('dialog', { name: label, exact: true });
        await popup.waitFor();
        await settle();
        const geometry = await popup.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const input = element.querySelector('input');
          const shell = input.parentElement;
          const inputStyle = getComputedStyle(input);
          return {
            width: rect.width,
            insideViewport:
              rect.left >= -1 &&
              rect.right <= innerWidth + 1 &&
              rect.top >= -1 &&
              rect.bottom <= innerHeight + 1,
            theme: element.closest('[data-ov-theme]')?.dataset.ovTheme,
            focused: input === document.activeElement,
            inputHeight: input.getBoundingClientRect().height,
            lineHeight: parseFloat(inputStyle.lineHeight),
            shellHeight: shell.getBoundingClientRect().height,
            minimumHeight: parseFloat(getComputedStyle(shell).minHeight),
            overflow: element.scrollWidth > element.clientWidth + 1,
          };
        });
        assert(
          geometry.insideViewport &&
            geometry.focused &&
            !geometry.overflow &&
            geometry.theme === theme.id &&
            Number.isFinite(geometry.minimumHeight) &&
            geometry.shellHeight >= geometry.minimumHeight - 1 &&
            geometry.inputHeight >= geometry.lineHeight - 1,
          JSON.stringify({ component: 'IconPicker', theme: theme.id, density, size, geometry }),
        );
        results.push({ component: 'IconPicker', theme: theme.id, density, size, geometry });
        if (density === 'comfortable' && size === 'md') {
          await popup.screenshot({ path: path.join(output, `icons-${theme.id}.png`) });
        }
        const search = popup.getByRole('searchbox', { name: 'Search icons' });
        await search.fill('cloud');
        await search.press('ArrowDown');
        assert(
          await popup
            .getByRole('button', { name: 'Cloud', exact: true })
            .evaluate((button) => button === document.activeElement),
        );
        await page.keyboard.press('Enter');
        await page.getByRole('button', { name: `${label}: Cloud`, exact: true }).waitFor();
      }
    }
  }
  await capture('icons-native-theme-size-matrix');

  await page.setViewportSize({ width: 360, height: 900 });
  for (const theme of ['dark', 'light']) {
    for (const textSize of ['80', '90', '100', '110', '125']) {
      await story('components-iconpicker--search-and-keyboard', theme, 'comfortable', textSize);
      const popup = page.getByRole('dialog', { name: 'Choose icon', exact: true });
      await popup.waitFor();
      await settle();
      const fitting = await popup.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const input = element.querySelector('input');
        return (
          rect.left >= -1 &&
          rect.right <= innerWidth + 1 &&
          element.scrollWidth <= element.clientWidth + 1 &&
          input.getBoundingClientRect().height >= parseFloat(getComputedStyle(input).lineHeight) - 1
        );
      });
      assert(fitting, `${theme} ${textSize} narrow picker clips content`);
      if (textSize === '125') await capture(`icons-narrow-${theme}-125`);
    }
  }
  for (const density of ['comfortable', 'compact']) {
    for (const size of sizes) {
      await story(
        'components-iconpicker--search-and-keyboard',
        'high-contrast-light',
        density,
        '125',
        `size:${size}`,
      );
      const popup = page.getByRole('dialog', { name: 'Choose icon', exact: true });
      await popup.waitFor();
      await settle();
      const fits = await popup.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.left >= -1 &&
          rect.right <= innerWidth + 1 &&
          element.scrollWidth <= element.clientWidth + 1
        );
      });
      assert(fits, `Narrow ${density} ${size} picker overflows at 125%`);
      if (density === 'comfortable' && size === 'xl') await capture('icons-narrow-xl-125');
      await popup.getByRole('searchbox', { name: 'Search icons' }).fill('cloud');
      await page.keyboard.press('Enter');
      await page.getByRole('button', { name: 'Choose icon: Cloud', exact: true }).waitFor();
      interactions.push({
        component: 'IconPicker',
        scenario: 'narrow-keyboard',
        size,
        density,
        textSize: '125',
      });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await story('components-iconpicker--nested-custom-reduced-motion');
  const customPopup = page.getByRole('dialog', { name: 'Custom scoped icon', exact: true });
  await customPopup.waitFor();
  assert.equal(
    await customPopup.evaluate((element) => getComputedStyle(element).transitionDuration),
    '0s',
  );
  await capture('icons-nested-custom-reduced-motion');

  await story('components-iconpicker--upload-and-library');
  let libraryPopup = page.getByRole('dialog', { name: 'Choose icon', exact: true });
  await libraryPopup.waitFor();
  await page.keyboard.press('Escape');
  await libraryPopup.waitFor({ state: 'hidden' });
  await page.getByRole('textbox', { name: 'New icon name' }).fill('On-call icon');
  await page.getByRole('button', { name: 'Choose icon: Folder', exact: true }).click();
  libraryPopup = page.getByRole('dialog', { name: 'Choose icon', exact: true });
  const fileInput = libraryPopup.getByLabel('Upload icon file');
  await fileInput.setInputFiles({
    name: 'blocked.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
  });
  await libraryPopup.getByRole('alert').waitFor();
  assert.match(
    await libraryPopup.getByRole('alert').textContent(),
    /Choose a PNG, JPEG, GIF or WebP/,
  );
  await fileInput.setInputFiles({
    name: 'verified-raster.png',
    mimeType: 'image/png',
    buffer: await readFile(path.join(output, 'icons-dark.png')),
  });
  await page.getByRole('button', { name: 'Choose icon: On-call icon', exact: true }).waitFor();
  assert.equal(
    await libraryPopup
      .getByRole('button', { name: 'On-call icon', exact: true })
      .getAttribute('aria-pressed'),
    'true',
  );
  await page.waitForFunction(() => {
    const image = document.querySelector('button[aria-label="On-call icon"] img');
    return image?.complete && image.naturalWidth > 0;
  });
  await capture('icons-upload-library');
  await libraryPopup.getByRole('button', { name: 'Remove selected image', exact: true }).click();
  await page.getByRole('button', { name: 'Choose icon: None', exact: true }).waitFor();
  assert.equal(
    await libraryPopup.getByRole('button', { name: 'On-call icon', exact: true }).count(),
    0,
  );
  interactions.push({
    component: 'IconPicker',
    scenario: 'named-raster-library',
    rejectedSvg: true,
    decodedRaster: true,
    selected: true,
    removed: true,
  });

  await story('components-keyedsearch--interactive-resources');
  let input = page.getByRole('combobox');
  await input.fill('api');
  await input.press('Enter');
  await page.getByText('Opened resource: api-production', { exact: true }).waitFor();
  await input.fill('reg');
  await input.press('Enter');
  await page.getByRole('option', { name: 'us-east-1', exact: true }).waitFor();
  await input.press('ArrowDown');
  await input.press('Enter');
  assert.equal(await input.inputValue(), 'region:eu-west-1');

  await story('components-keyedsearch--ten-thousand-values');
  input = page.getByRole('combobox');
  await input.click();
  await page.getByRole('option').first().waitFor();
  assert.equal(await page.getByRole('option').count(), 12);
  const list = page.getByRole('listbox');
  const box = await list.boundingBox();
  await page.mouse.move(box.x + box.width - 3, box.y + 220);
  await page.mouse.wheel(0, 300);
  await input.press('End');
  await input.pressSequentially('resource-0');
  await settle();
  assert(
    (await popupGeometry()).activeVisible,
    'Filtered active completion is scrolled out of view',
  );
  await input.fill('name:09999');
  await page.getByRole('option', { name: 'Resource 9999 Application', exact: true }).waitFor();
  assert.equal(await page.getByRole('option').count(), 1);

  await page.setViewportSize({ width: 360, height: 900 });
  await story('components-keyedsearch--narrow-pane', 'high-contrast-light', 'compact', '125');
  input = page.getByRole('combobox');
  await input.fill('owner:');
  await page.getByRole('listbox').waitFor();
  await settle();
  assert((await popupGeometry()).insideViewport);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await capture('narrow-search-125');

  await story('components-card-interactive--reduced-motion');
  await page.locator('section[data-ov-interactive]').first().waitFor();
  assert.equal(
    await page
      .locator('section[data-ov-interactive]')
      .first()
      .evaluate((card) => getComputedStyle(card).transitionDuration),
    '0s',
  );
  assert.deepEqual(errors, []);
  const report = {
    nativeThemes: BUILT_IN_THEMES.map(({ id }) => id),
    results,
    interactions,
    browserErrors: errors,
  };
  await writeFile(path.join(output, 'verification.json'), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `Verified ${results.length} native-theme/size/density records, text scales, direct navigation, completion, bounded 10k candidates, narrow panes and reduced motion. Evidence: ${output}\n`,
  );
} finally {
  await browser.close();
}

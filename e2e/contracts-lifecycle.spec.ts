import { test, expect } from '@playwright/test';

test.describe('End-to-End Contract Lifecycle & UI Screenshots', () => {
  const timestamp = Date.now();
  const creator = {
    username: `creator_${timestamp}`,
    email: `creator_${timestamp}@example.com`,
    password: 'Password123!',
    displayName: 'Creator User',
  };

  const partner = {
    username: `partner_${timestamp}`,
    email: `partner_${timestamp}@example.com`,
    password: 'Password123!',
    displayName: 'Partner User',
  };

  test('full user journey: register, create contract, partner accept, submit proof, and capture screenshots', async ({ page }) => {
    // 1. Homepage Guest View Screenshot
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/01_homepage_guest.png', fullPage: true });

    // 2. Register Creator
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/02_register_page.png' });
    await page.locator('input[placeholder*="hitesh"]').first().fill(creator.username);
    await page.locator('input[placeholder*="Hitesh Prajapati"]').fill(creator.displayName);
    await page.locator('input[placeholder*="example.com"]').fill(creator.email);
    await page.locator('input[type="password"]').fill(creator.password);
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 3. Logged-in Homepage View Screenshot
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: /go to dashboard/i })).toBeVisible();
    await page.screenshot({ path: 'screenshots/03_homepage_authenticated.png', fullPage: true });

    // 4. Register Partner in separate session
    const partnerContext = await page.context().browser()!.newContext();
    const partnerPage = await partnerContext.newPage();
    await partnerPage.goto('/register');
    await partnerPage.waitForLoadState('networkidle');
    await partnerPage.locator('input[placeholder*="hitesh"]').first().fill(partner.username);
    await partnerPage.locator('input[placeholder*="Hitesh Prajapati"]').fill(partner.displayName);
    await partnerPage.locator('input[placeholder*="example.com"]').fill(partner.email);
    await partnerPage.locator('input[type="password"]').fill(partner.password);
    await partnerPage.getByRole('button', { name: /create account/i }).click();
    await expect(partnerPage).toHaveURL(/\/dashboard/);

    // 5. Creator creates a contract via 8-step wizard
    await page.goto('/create');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/04_create_contract_step1.png' });

    // Step 1: Goal details
    await page.locator('input[placeholder*="Solve 2 LeetCode"]').fill('Read 25 Pages of System Design');
    await page.locator('input[placeholder="2"]').fill('25');
    await page.locator('input[placeholder*="problems / km / pages"]').fill('pages');
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 2: Frequency
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/05_create_contract_step2.png' });
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 3: Partner Assignment
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/06_create_contract_step3.png' });
    await page.locator('input[placeholder*="username (e.g. rahul)"]').fill(partner.username);
    await page.waitForTimeout(600); // Debounce search
    const selectBtn = page.getByRole('button', { name: /Select/i });
    if (await selectBtn.isVisible()) {
      await selectBtn.click();
    }
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 4: Lives
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/07_create_contract_step4_lives.png' });
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 5: Failure Consequence
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/08_create_contract_step5_penalty.png' });
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 6: Recovery Mechanics
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/09_create_contract_step6_recovery.png' });
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 7: Proof Requirement
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/10_create_contract_step7_proof.png' });
    await page.getByRole('button', { name: /^next$/i }).click();

    // Step 8: Review & Send
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/11_create_contract_step8_review.png' });
    await page.getByRole('button', { name: /send contract/i }).click();

    // Creator should see contract on detail page (PENDING_ACCEPTANCE)
    await expect(page).toHaveURL(/\/commitments\//);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/12_creator_contract_detail_pending.png', fullPage: true });

    // 6. Partner sees incoming accountability request on dashboard
    await partnerPage.goto('/dashboard');
    await partnerPage.waitForLoadState('networkidle');
    await expect(partnerPage.getByText('Read 25 Pages of System Design')).toBeVisible();
    await expect(partnerPage.getByRole('button', { name: /accept contract/i })).toBeVisible();
    await partnerPage.screenshot({ path: 'screenshots/13_partner_incoming_request.png', fullPage: true });

    // Partner clicks Accept Contract
    await partnerPage.getByRole('button', { name: /accept contract/i }).click();
    await expect(partnerPage.getByRole('button', { name: /accept contract/i })).not.toBeVisible();
    await partnerPage.screenshot({ path: 'screenshots/14_partner_dashboard_active.png', fullPage: true });

    // 7. Creator views active contract on dashboard and detail inspector
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Read 25 Pages of System Design')).toBeVisible();
    await page.screenshot({ path: 'screenshots/15_creator_dashboard_active.png', fullPage: true });

    // 8. Creator submits daily proof / check-in from dashboard
    await page.getByRole('button', { name: /log proof/i }).first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/16_proof_submission_modal.png' });
    await page.locator('textarea[placeholder*="Completed LeetCode"]').fill('Finished Chapters 1 to 3 (25 pages total)');
    await page.getByRole('button', { name: /Confirm Proof/i }).click();

    // Verify day completion status
    await expect(page.getByText(/Done ✓/i)).toBeVisible();
    await page.screenshot({ path: 'screenshots/17_contract_proof_completed.png', fullPage: true });

    // 9. Inspect full contract detail page with heatmap
    await page.getByRole('link', { name: /inspect contract/i }).first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/18_contract_detail_inspector.png', fullPage: true });

    // 10. Light Mode & Dark Mode Verification
    await page.locator('button[title*="mode"]').click(); // Toggle theme
    await page.screenshot({ path: 'screenshots/19_theme_toggled_view.png', fullPage: true });

    await partnerContext.close();
  });
});

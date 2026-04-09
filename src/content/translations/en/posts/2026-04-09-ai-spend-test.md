---
title: AI Spend Coach Service Brief
description: AI Spend Coach Service Brief
date: '2026-04-09'
published: true
category: Technical
locale: en
sourcePath: src/content/posts/2026-04-09-ai-spend-test.md
sourceHash: 5fa2f1f29bbeffd2f778b7684c4a6d43e1dd6866615565fa5a0ff335cb762530
translationSource: deepl
translatedAt: '2026-04-09T05:59:36.087Z'
---
# AI Spend Coach Service Brief

working title: **Money Leak Coach*

## 1. Service Overview

**One Line Definition**
lLM-based spending coaching service that analyzes your card, subscription, and spending data to **find recurring spending patterns**, **interpret why you're leaking money**, and provide **action guides and reminders to take action**.

**Service Core Value**
whereas traditional pocketbooks only show you "how much you spent", this service tells you "why you spent it" and "what you need to change now".  
in other words, we aim to be a behavioral financial assistant, not just a record-keeping service.

---

## 2. Define the problem

users can see their card statements and spending history, but in practice, they often experience the following issues

- they have a lot of subscriptions, and it's hard to see at a glance what's on auto-pay.
- small recurring expenses like coffee, delivery, travel, and shopping don't add up.
- "You can see the numbers but can't understand why you're running out of money this month.
- you set a budget, but you get off track, and there's no alert/feedback system to catch you.

to solve this problem, the service reorganizes your spending into patterns, causes, and behaviors, not just categories.

--->

## 3. Service Goals

this service has four goals

1. **Automatically detect recurring spending patterns

  automatically identify recurring subscriptions, small recurring payments, time-of-day/day-of-week spending, category spikes, and more.
2. **Interpret spend drivers

  instead of just saying, "We spent more on dining out this month."
   "I've been working more nights, which has increased my weeknight delivery spend, and I've been eating out on the weekends, which has added up."
3. **Provide a call to action

  instead of "cut back"
   "This subscription is a candidate for cancellation," "Set a cap on your delivery budget," "Challenge yourself to go no spend twice a week," or "Mismatch your current card offers."
4. **Provide real-time alerts and progress feedback

  alert you when you're about to overspend and provide easy-to-understand feedback on your current progress against your goals.

---

## 4. Target users

### Primary Target

20-40 year olds / freelancers / single-person households

### Common characteristics

- have 2 or more credit cards, multiple subscription services
- paychecks come in, but you don't know "why there's always not enough"
- find it hard to keep a consistent budget and want **automated analysis** instead
- you need **interpretation and advice** more than numbers

### Representative personas

"OTT, music, cloud, coffee, delivery, taxi, shopping, and the list goes on and on,
but don't know exactly where the money is coming from and are anxious at the end of the month."

---John

## 5. Core Features

## 5-1. Recurring spending pattern detection

examples of detection targets are as follows

- **Recurring subscription patterns: OTT, music, productivity tools, cloud, memberships, etc
- **Hidden recurring spend: Spending that occurs on similar days/time periods each week
- **Small leakage patterns: small but frequent expenses like coffee, convenience stores, delivery, taxis, etc
- **Abnormal spike patterns: Spending in certain categories is higher than usual
- **Duplicate payments/inefficient subscriptions: simultaneous payments for similar services, subscriptions that are rarely used
- **Habitual spending patterns: spending at night, stressful shopping, overspending right after payday, etc

### Example of feature results

- "Recurring Friday night delivery spending over the last 8 weeks"
- "Spending at cafes increased 42% compared to the last 3-month average"
- "Maintaining 3 similar video subscriptions at the same time"
- "Spending in the first 5 days of the month accounts for 37% of the total budget"

--- and

```ts
// src/routes/api/users/+server.ts
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const users = await db.getUsers();
  return json(users);
}

export async function POST({ request }) {
  const data = await request.json();
  const user = await db.createUser(data);
  return json(user, { status: 201 });
}
```



&nbsp;

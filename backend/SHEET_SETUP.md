# Google Sheet Setup (Important)

Open your Google Sheet and create these **exact headers** in the first row of each tab.

## 1. Courts Sheet
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| id | name | type | location | price_per_hour | image | description | amenities | is_active |

**Sample data (row 2):**
```
1 | Court A - Indoor | Badminton | Main Building, 1st Floor | 800 | https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600 | Premium indoor court | AC, Wooden Floor, LED Lights | TRUE
```

## 2. Bookings Sheet
| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| id | court_id | court_name | date | slot_start | slot_end | customer_name | mobile | email | amount | payment_screenshot | status | created_at | notes |

(Leave empty initially - system will add rows)

## 3. Customers Sheet
| A | B | C | D | E |
|---|---|---|---|---|
| id | name | mobile | email | created_at |

(Leave empty initially)

## 4. Settings Sheet
| A | B |
|---|---|
| key | value |

**Sample:**
```
business_name | Sports Court Booking
support_email | support@example.com
```

---

### After headers are set:
1. Share the Google Sheet with the **same Google account** you will authorize via OAuth
2. Copy Spreadsheet ID into `.env`
3. Run backend and visit `http://localhost:5000/auth/google` to authorize

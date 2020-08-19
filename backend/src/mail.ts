const nodemailer = require('nodemailer');
const inLineCss = require('nodemailer-juice');
const { format, parseISO } = require('date-fns');

function formatMoney(amount: any) {
  const options = {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  };
  // If its a whole, dollar amount, leave off the .00 
  if (amount % 100 === 0) options.minimumFractionDigits = 0;
  const formatter = new Intl.NumberFormat('en-GB', options);
  return formatter.format(amount / 100);
}

const transport1 = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  transport1.use('compile', inLineCss());

  const makeANiceEmail1 = (text: string) => `
    <div 
        style="border: 1px solid black;
        padding: 20px;
        font-family: sans-serif;
        line-height: 2;
        font-size: 20px;
    ">
        <h2>Hello There!</h2>
        <p>${text}</p>
        
        <p>😘, Flamingo Staff</p>
    </div>
  `;

  const orderRequest1 = (order: any, orderItems: any) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 1000px; margin: 0 auto; border: 1px solid #a5a5a5; box-shadow: '0 12px 24px 0 rgba(0, 0, 0, 0.09)'; padding: 2rem; border-top: 10px solid blue;">
      <h2>Customer order reads as follows:</h2>
      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
      <style>span { 
        padding: 1rem;
        font-weight: 900;
        text-align: right;
      }
      </style>
      <span>Order ID: </span>
      <style>span { 
        padding: 1rem;
        font-weight: 900;
        text-align: left;
      }
      </style>
      <span>${order.id}</span>
      </p>

      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: right;
        }
        </style>
        <span>Charge: </span>
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: left;
        }
        </style>
        <span>${order.charge}</span>
      </p>

      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: right;
        }
        </style>
        <span>Charged to: </span>
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: left;
        }
        </style>
        <span>${order.card_brand + "...." + order.last4card_digits}</span>
      </p>

      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: right;
        }
        </style>
        <span>Date</span>
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: left;
        }
        </style>
        <span>${format(parseISO(order.createdAt), 'MMMM d, yyyy h:mm a', { awareOfUnicodeTokens: true })}</span>
      </p>

      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
      <style>span { 
        padding: 1rem;
        font-weight: 900;
        text-align: right;
      }
      </style>
      <span>Shipping:</span>
      <style>span { 
        padding: 1rem;
        font-weight: 900;
        text-align: left;
      }
      </style>
      <span>${order.card_name}, <br/> 
      ${order.address_line}, <br/>
      ${order.city}, <br/>
      ${order.postcode}, <br/>
      ${order.country}
      </span>
      </p>

      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: right;
        }
        </style>
        <span>Order Total: </span>
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: left;
        }
        </style>
        <span>${formatMoney(order.total)}</span>
      </p>

      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: right;
        }
        </style>
        <span>Item Count: </span>
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: left;
        }
        </style>
        <span>${order.items.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
      </p>
      <div className="items">
        ${order.items.map((item: any) => (
          `<div style="border-bottom: 1px solid grey; display: grid; grid-template-columns: 1fr 1fr; align-items: center; grid-gap: 2rem; margin: 2rem 0; padding-bottom: 2rem;" className="order-item" key=${item.id}>
            <style>img { 
              width: 100%;
              height: 100%;
            }
            </style>
            <img src=${item.image} alt=${item.title} />
            <div className="item-details">
              <h2>${item.title}</h2>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style> 
              <p><span style="grid-area: 1 / 1 / span 1 / span 2;">${item.description}</span></p>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style> 
              <p><span>Colour:</span> <span>${item.color.label}</span></p>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style>               
              <p><span>Size:</span> <span>${item.size.label}</span></p>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style> 
              <p><span>Qty:</span> <span>${item.quantity}</span></p>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style> 
              <p><span>Price:</span> <span>${formatMoney(item.price)}</span></p>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style> 
              <p><span>SubTotal:</span> <span>${formatMoney(item.price * item.quantity)}</span></p>
            </div>
          </div>`
        ))}
      </div>
      <style>span { 
        padding: 1rem;
        font-weight: 900;
      }
      </style>      
      <span>😘, Flamingo Staff</span>
  </div>
  `;

  const mailReceipt1 = (order: any, orderItems: any) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 1000px; margin: 0 auto; border: 1px solid #a5a5a5; box-shadow: '0 12px 24px 0 rgba(0, 0, 0, 0.09)'; padding: 2rem; border-top: 10px solid blue;">
      <h2>Your receipt reads as follows:</h2>
      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
      <style>span { 
        padding: 1rem;
        font-weight: 900;
        text-align: right;
      }
      </style>
      <span>Order ID: </span>
      <style>span { 
        padding: 1rem;
        font-weight: 900;
        text-align: left;
      }
      </style>
      <span>${order.id}</span>
      </p>

      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: right;
        }
        </style>
        <span>Charged to: </span>
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: left;
        }
        </style>
        <span>${order.card_brand + "...." + order.last4card_digits}</span>
      </p>

      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: right;
        }
        </style>
        <span>Date</span>
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: left;
        }
        </style>
        <span>${format(parseISO(order.createdAt), 'MMMM d, yyyy h:mm a', { awareOfUnicodeTokens: true })}</span>
      </p>

      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
      <style>span { 
        padding: 1rem;
        font-weight: 900;
        text-align: right;
      }
      </style>
      <span>Shipping:</span>
      <style>span { 
        padding: 1rem;
        font-weight: 900;
        text-align: left;
      }
      </style>
      <span>${order.card_name}, <br/> 
      ${order.address_line}, <br/>
      ${order.city}, <br/>
      ${order.postcode}, <br/>
      ${order.country}
      </span>
      </p>

      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: right;
        }
        </style>
        <span>Order Total: </span>
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: left;
        }
        </style>
        <span>${formatMoney(order.total)}</span>
      </p>

      <p style="display: grid; grid-template-columns: 1fr 5fr; margin: 0; border-bottom: 1px solid #a5a5a5;">
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: right;
        }
        </style>
        <span>Item Count: </span>
        <style>span { 
          padding: 1rem;
          font-weight: 900;
          text-align: left;
        }
        </style>
        <span>${order.items.reduce((a: any, b: any) => a + b.quantity, 0)}</span>
      </p>
      <div className="items">
        ${order.items.map((item: any) => (
          `<div style="border-bottom: 1px solid grey; display: grid; grid-template-columns: 1fr 1fr; align-items: center; grid-gap: 2rem; margin: 2rem 0; padding-bottom: 2rem;" className="order-item" key=${item.id}>
            <style>img { 
              width: 100%;
              height: 100%;
            }
            </style>
            <img src=${item.image} alt=${item.title} />
            <div className="item-details">
              <h2>${item.title}</h2>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style> 
              <p><span style="grid-area: 1 / 1 / span 1 / span 2;">${item.description}</span></p>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style> 
              <p><span>Colour:</span> <span>${item.color.label}</span></p>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style>               
              <p><span>Size:</span> <span>${item.size.label}</span></p>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style> 
              <p><span>Qty:</span> <span>${item.quantity}</span></p>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style> 
              <p><span>Price:</span> <span>${formatMoney(item.price)}</span></p>
              <style>p { 
                display: grid;
                grid-template-columns: 1fr 5fr;
                margin: 0;
              }
              </style> 
              <p><span>SubTotal:</span> <span>${formatMoney(item.price * item.quantity)}</span></p>
            </div>
          </div>`
        ))}
      </div>
      <style>span { 
        padding: 1rem;
        font-weight: 900;
      }
      </style>      
      <span>😘, Flamingo Staff</span>
  </div>
  `;

  exports.transport = transport1;
  exports.makeANiceEmail = makeANiceEmail1;
  exports.orderRequest = orderRequest1;
  exports.mailReceipt = mailReceipt1;
  
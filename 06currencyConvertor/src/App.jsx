import { useState } from 'react'
import { InputBox } from './components'
import useCurrencyInfo from './hooks/useCurrencyInfo'

function App() {
  const [amount, setAmount] = useState(0)
  const [from, setFrom] = useState("usd")
  const [to, setTo] = useState("inr")
  const [convertedAmount, setConvertedAmount] = useState(0)

  const currencyInfo = useCurrencyInfo(from)
  const options = Object.keys(currencyInfo)

  const swap = () => {
    setFrom(to)
    setTo(from)
    setConvertedAmount(amount)
    setAmount(convertedAmount)
  }

  const convert = () => {
    setConvertedAmount((amount * currencyInfo[to]).toFixed(2))
  }

  return (
    <div
      className="min-h-screen w-full flex justify-center items-center bg-cover bg-no-repeat p-4"
      style={{
        backgroundImage: `url('https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
      }}
    >
      <div className="w-full max-w-md mx-auto bg-white/20 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-white/40">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            convert()
          }}
          className="space-y-5"
        >
          <h1 className="text-center text-2xl font-bold text-white drop-shadow-sm">
            Currency Converter 💱
          </h1>

          <InputBox
            label="From"
            amount={amount}
            currencyOptions={options}
            onCurrencyChange={(currency) => setFrom(currency)}
            selectCurrency={from}
            onAmountChange={(amount) => setAmount(amount)}
          />

          <div className="relative w-full text-center">
            <button
              type="button"
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded-full text-sm shadow-md transition-all duration-200"
              onClick={swap}
            >
              🔁 Swap
            </button>
          </div>

          <InputBox
            label="To"
            amount={convertedAmount}
            currencyOptions={options}
            onCurrencyChange={(currency) => setTo(currency)}
            selectCurrency={to}
            amountDisable
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold shadow-md transition-all duration-200"
          >
            Convert {from.toUpperCase()} to {to.toUpperCase()}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App

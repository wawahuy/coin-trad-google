import React from 'react'
import './index.scss'

export default function LoginPage() {
  return (
    <div className="container">
      <div className="row">
          <div className="col-lg-3 col-md-2"></div>
          <div className="col-lg-6 col-md-8 login-box">
              <div className="col-lg-12 login-key">
                  <i className="fa fa-key" aria-hidden="true"></i>
              </div>
              <div className="col-lg-12 login-title">
                  ADMIN PANEL
              </div>

              <div className="col-lg-12 login-form">
                  <div className="col-lg-12 login-form">
                      <form>
                          <div className="form-group">
                              <label className="form-control-label">USERNAME</label>
                              <input type="text" className="form-control" />
                          </div>
                          <div className="form-group">
                              <label className="form-control-label">PASSWORD</label>
                              <input type="password" className="form-control" />
                          </div>

                          <div className="col-lg-12 p-3 d-flex justify-content-center">
                              <button type="submit" className="btn btn-outline-primary">LOGIN</button>
                          </div>
                      </form>
                  </div>
              </div>
              <div className="col-lg-3 col-md-2"></div>
          </div>
      </div>
    </div>
  )
}

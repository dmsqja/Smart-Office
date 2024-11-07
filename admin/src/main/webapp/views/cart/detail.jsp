
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<script>
    let cart_detail = {
        init:function(){

            $('#cart_update_form > #btn_delete').click(()=>{
                let c = confirm('삭제하시겠습니까?');
                if(c == true){
                    location.href = '<c:url value="/cart/delete"/>'+'?custId=' + '${cart.custId}' + '&itemId=' + '${cart.itemId}';
                }
            });
        },
        send:function(){
            $('#cart_update_form').attr({
                'method':'post',
                'enctype':'multipart/form-data',
                'action':'<c:url value="/cart/update"/>'
            });
            $('#cart_update_form').submit();
        }
    };
    $(function(){
        cart_detail.init();
    });
</script>



<div class="container-fluid">

    <!-- Page Heading -->
    <h1 class="h3 mb-2 text-gray-800">Tables</h1>

    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">DataTables Example</h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <form id="cart_update_form">
                    <div class="form-group">
                        <label for="id">ID:</label>
                        <input type="text"  readonly="readonly" value="${cart.custId}" class="form-control" id="id" placeholder="Enter id" name="custId">

                    </div>
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text"  value="${cart.itemName}"  class="form-control" id="name" placeholder="Enter password" name="itemName">

                    </div>
                    <div class="form-group">
                        <label for="price">Price:</label>
                        <input type="number" value="${cart.itemPrice}"  class="form-control" id="price" placeholder="Enter name" name="itemPrice">

                    </div>
                    <div class="form-group">
                        <h6>
                            <fmt:parseDate value="${ cart.regDate }"
                                           pattern="yyyy-MM-dd" var="parsedDateTime" type="both" />
                            <fmt:formatDate pattern="yyyy년 MM월 dd일" value="${ parsedDateTime }" />
                        </h6>
                        <h6>
                            ${cart.totalPrice}
                        </h6>
                    </div>
                    <div class="form-group">
                       <img  src="<c:url value="/imgs"/>/${cart.imgName}">
                       <input type="hidden"  name="imgName" value="${cart.imgName}"/>
                    </div>
                    <div class="form-group">
                        <label for="newimage">New Image:</label>
                        <input type="file"  class="form-control" id="newimage" placeholder="Enter name" name="image">
                        
                    </div>
                    <button id="btn_delete" type="button" class="btn btn-primary">Delete</button>

                </form>
            </div>
        </div>
    </div>

</div>



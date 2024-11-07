<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<style>
    #dataTable img{
        width:100px !important;
    }
    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .quantity-controls button {
        padding: 2px 8px;
        border: 1px solid #ddd;
        background: #f8f9fc;
        border-radius: 4px;
        cursor: pointer;
    }
    .quantity-controls button:hover {
        background: #eaecf4;
    }
    .quantity-controls input {
        width: 50px;
        text-align: center;
        padding: 4px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
</style>

<script>
    $(document).ready(function() {
        // 수량 변경 버튼 클릭 이벤트
        $('.quantity-btn').on('click', function() {  // 화살표 함수를 일반 함수로 변경
            const $btn = $(this);
            const $container = $btn.closest('.quantity-controls');
            const $input = $container.find('input');
            const $row = $btn.closest('tr');

            const currentValue = parseInt($input.val());
            const change = parseInt($btn.data('change')); // parseInt 추가
            const newValue = currentValue + change;

            // 수량이 1 미만이 되지 않도록 체크
            if (newValue < 1) return;

            // CartDto에 맞는 데이터 구성
            const cartData = {
                custId: $container.data('custId'),
                itemId: $container.data('itemId'),
                count: newValue,
            };

            // AJAX 요청
            $.ajax({
                url: '<c:url value="/cart/update_quantity"/>',
                type: 'POST',
                data: cartData,
                dataType: 'text',
                success: function(response) {
                    if (response === 'success') {
                        updateUI($row, newValue);
                    } else {
                        alert('수량 업데이트에 실패했습니다.');
                        console.log('Server response:', response);
                        $input.val(currentValue);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                    console.log('Status:', status);
                    console.log('Response:', xhr.responseText);
                    alert('수량 업데이트 중 오류가 발생했습니다.');
                    $input.val(currentValue);
                }
            });
        });

        // UI 업데이트 함수
        function updateUI($row, newValue) {
            // 수량 입력 필드 업데이트
            $row.find('input[type="number"]').val(newValue);

            // 총 가격 계산 및 업데이트
            const unitPrice = parseInt($row.find('.item-price').data('unitPrice'));
            const newTotal = unitPrice * newValue;

            // 총 가격 표시 업데이트 (천단위 구분 포함)
            $row.find('.total-price').text(
                new Intl.NumberFormat('ko-KR').format(newTotal) + '원'
            );
        }
    });
</script>

<div class="container-fluid">
    <!-- Page Heading -->
    <h1 class="h3 mb-2 text-gray-800">Tables</h1>
    <p class="mb-4">DataTables is a third party plugin that is used to generate the demo table below.
        For more information about DataTables, please visit the <a target="_blank"
                                                                   href="https://datatables.net">official DataTables documentation</a>.</p>

    <!-- DataTales Example -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">DataTables Example</h6>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
                    <thead>
                    <tr>
                        <th>Image</th>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Count</th>
                        <th>Price</th>
                        <th>TotalPrice</th>
                        <th>Reg Date</th>
                    </tr>
                    </thead>
                    <tfoot>
                    <tr>
                        <th>Image</th>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Count</th>
                        <th>Price</th>
                        <th>TotalPrice</th>
                        <th>Reg Date</th>
                    </tr>
                    </tfoot>
                    <tbody>
                    <c:forEach var="cart" items="${cartlist}">
                        <tr>
                            <td>
                                <a href="<c:url value="/cart/detail"/>?custId=${cart.custId}&itemId=${cart.itemId}">
                                    <img src="<c:url value="/imgs"/>/${cart.imgName}">
                                </a>
                            </td>
                            <td>${cart.custId}</td>
                            <td>${cart.itemName}</td>
                            <td>
                                <div class="quantity-controls" data-cust-id="${cart.custId}" data-item-id="${cart.itemId}">
                                    <button type="button" class="quantity-btn" data-change="-1">-</button>
                                    <input type="number" value="${cart.count}" min="1" readonly>
                                    <button type="button" class="quantity-btn" data-change="1">+</button>
                                </div>
                            </td>
                            <td class="item-price" data-unit-price="${cart.itemPrice}">
                                <fmt:formatNumber type="number" pattern="###,###원" value="${cart.itemPrice}" />
                            </td>
                            <td class="total-price">
                                <fmt:formatNumber type="number" pattern="###,###원" value="${cart.totalPrice}" />
                            </td>
                            <td>
                                <fmt:parseDate value="${cart.regDate}"
                                               pattern="yyyy-MM-dd'T'HH:mm" var="parsedDateTime" type="both" />
                                <fmt:formatDate pattern="dd.MM.yyyy HH:mm" value="${parsedDateTime}" />
                            </td>
                        </tr>
                    </c:forEach>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>